/* ============================================================
 * Mini Project: Design and Analysis of Held-Karp Algorithm for
 *               solving the Travelling Salesman Problem (TSP)
 * Author: Harpreet Kaur Gothra  |  USN: R24EI020  |  Date: 26-05-2026
 * Build : gcc held_karp.c -o tsp `pkg-config --cflags --libs gtk+-3.0` -lm
 * ============================================================ */

#include <gtk/gtk.h>
#include <cairo.h>
#include <pango/pangocairo.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdarg.h>
#include <limits.h>
#include <math.h>
#include <time.h>

#define MAX_CITIES   12
#define INF          (INT_MAX / 4)
#define HEADER_H     70
#define FOOTER_H     70
#define PANEL_W      500
#define CITY_R       26.0
#define FPS_MS       16
#define ANIM_SPEED   0.5

/* ===== Colors ===== */
typedef struct { double r, g, b, a; } Color;
#define COL(R,G,B,A) ((Color){(R)/255.0,(G)/255.0,(B)/255.0,(A)})
static const Color C_BG=COL(247,249,252,1), C_PANEL=COL(255,255,255,1), C_BORD=COL(228,232,240,1);
static const Color C_NAVY=COL(17,39,80,1), C_NAVY_SUB=COL(180,200,230,1);
static const Color C_TEXT=COL(30,41,59,1), C_DIM=COL(100,116,139,1), C_LIGHT=COL(148,163,184,1);
static const Color C_ACC=COL(59,130,246,1), C_ACC_BG=COL(219,234,254,1);
static const Color C_OK=COL(16,185,129,1),  C_OK_BG=COL(209,250,229,1);
static const Color C_WARN=COL(245,158,11,1), C_DANGER=COL(220,38,38,1);
static const Color C_GRID=COL(232,236,244,1);
static const Color C_CITY=COL(59,130,246,1), C_CITY_START=COL(245,158,11,1), C_CITY_ACT=COL(16,185,129,1);

/* ===== Algorithm state ===== */
static int    n = 0;
static double cx[MAX_CITIES], cy[MAX_CITIES];
static int    dist_mat[MAX_CITIES][MAX_CITIES];
static int    dp[1 << MAX_CITIES][MAX_CITIES];
static int    parent_tbl[1 << MAX_CITIES][MAX_CITIES];
static int    tour[MAX_CITIES + 1];
static int    tour_len = 0, tour_cost = 0;
static double computed_ms = 0;

/* ===== UI state ===== */
static GtkWidget *canvas;
static int    sel_i = -1, sel_j = -1;
static char   input_buf[8] = "";
static double mat_x, mat_y, mat_cell;
static double canvas_x0, canvas_y0, canvas_w, canvas_h;

/* ===== Animation state ===== */
typedef enum { PH_IDLE, PH_BASE, PH_BUILDUP, PH_CLOSING, PH_REVEAL, PH_DONE } Phase;
static Phase  phase = PH_IDLE;
static double phase_t = 0, phase_dur = 0;
static int    build_level = 2, reveal_idx = 0;
static double reveal_t = 0;
static guint  timer_id = 0;
static gint64 last_tick_us = 0;
static char   status_text[256] = "Click on the canvas to add cities, then click any matrix cell to edit a distance.";

static gboolean on_anim_tick(gpointer data);

/* ============================================================
 * Held-Karp: bottom-up DP over (subset, last_city) states.
 * Asymmetric distances supported - uses dist_mat[i][j] directly.
 * ============================================================ */
static int held_karp(void) {
    int full = (1 << n) - 1;
    for (int s = 0; s <= full; s++)
        for (int i = 0; i < n; i++) { dp[s][i] = INF; parent_tbl[s][i] = -1; }
    dp[1][0] = 0;
    struct timespec t0, t1;
    clock_gettime(CLOCK_MONOTONIC, &t0);
    for (int s = 1; s <= full; s++) {
        if (!(s & 1)) continue;
        for (int i = 0; i < n; i++) {
            if (!(s & (1 << i)) || dp[s][i] >= INF) continue;
            for (int j = 1; j < n; j++) {
                if (s & (1 << j)) continue;
                int ns = s | (1 << j);
                int cand = dp[s][i] + dist_mat[i][j];
                if (cand < dp[ns][j]) { dp[ns][j] = cand; parent_tbl[ns][j] = i; }
            }
        }
    }
    int best = INF, last = -1;
    for (int i = 1; i < n; i++) {
        if (dp[full][i] >= INF) continue;
        int total = dp[full][i] + dist_mat[i][0];
        if (total < best) { best = total; last = i; }
    }
    clock_gettime(CLOCK_MONOTONIC, &t1);
    computed_ms = (t1.tv_sec - t0.tv_sec) * 1000.0 + (t1.tv_nsec - t0.tv_nsec) / 1.0e6;
    tour[0] = last;
    return best;
}

static void reconstruct_tour(int last) {
    int mask = (1 << n) - 1, curr = last;
    int rev[MAX_CITIES + 1], idx = 0;
    while (curr != -1) {
        rev[idx++] = curr;
        int p = parent_tbl[mask][curr];
        mask ^= (1 << curr);
        curr = p;
    }
    tour_len = 0;
    for (int i = idx - 1; i >= 0; i--) tour[tour_len++] = rev[i];
    tour[tour_len++] = 0;
}

/* ============================================================
 * Helpers - drawing, layout, state mutation
 * ============================================================ */
static void set_color(cairo_t *cr, Color c) { cairo_set_source_rgba(cr, c.r, c.g, c.b, c.a); }
static double ease_out(double t) { if (t<0) t=0; if (t>1) t=1; double u=1-t; return 1-u*u*u; }

static void rounded_rect(cairo_t *cr, double x, double y, double w, double h, double r) {
    cairo_new_sub_path(cr);
    cairo_arc(cr, x+w-r, y+r,   r, -M_PI/2,    0);
    cairo_arc(cr, x+w-r, y+h-r, r,  0,       M_PI/2);
    cairo_arc(cr, x+r,   y+h-r, r,  M_PI/2,  M_PI);
    cairo_arc(cr, x+r,   y+r,   r,  M_PI,    1.5*M_PI);
    cairo_close_path(cr);
}

static void draw_text_at(cairo_t *cr, double x, double y, const char *fd, Color c, const char *txt, int centered) {
    PangoLayout *l = pango_cairo_create_layout(cr);
    PangoFontDescription *f = pango_font_description_from_string(fd);
    pango_layout_set_font_description(l, f);
    pango_layout_set_text(l, txt, -1);
    set_color(cr, c);
    if (centered) { int w, h; pango_layout_get_pixel_size(l, &w, &h); cairo_move_to(cr, x-w/2.0, y-h/2.0); }
    else cairo_move_to(cr, x, y);
    pango_cairo_show_layout(cr, l);
    pango_font_description_free(f); g_object_unref(l);
}

static void text_size(cairo_t *cr, const char *fd, const char *txt, int *w, int *h) {
    PangoLayout *l = pango_cairo_create_layout(cr);
    PangoFontDescription *f = pango_font_description_from_string(fd);
    pango_layout_set_font_description(l, f);
    pango_layout_set_text(l, txt, -1);
    pango_layout_get_pixel_size(l, w, h);
    pango_font_description_free(f); g_object_unref(l);
}

static void status(const char *fmt, ...) {
    va_list ap; va_start(ap, fmt);
    vsnprintf(status_text, sizeof(status_text), fmt, ap);
    va_end(ap);
    if (canvas) gtk_widget_queue_draw(canvas);
}

/* ===== City and matrix manipulation ===== */
static int default_dist(int i, int j) { return (i == j) ? 0 : ((i * 7 + j * 11 + 13) % 25) + 8; }

static void add_city(double x, double y) {
    if (n >= MAX_CITIES) { status("Maximum %d cities reached.", MAX_CITIES); return; }
    cx[n] = x; cy[n] = y;
    for (int k = 0; k <= n; k++) { dist_mat[n][k] = default_dist(n, k); dist_mat[k][n] = default_dist(k, n); }
    n++;
    status("Added city %d at (%.0f, %.0f). Total: %d cities. Click Solve TSP when ready.", n-1, x, y, n);
}

static void delete_city(int idx) {
    if (n <= 0 || idx < 0 || idx >= n) return;
    for (int i = idx; i < n - 1; i++) { cx[i] = cx[i+1]; cy[i] = cy[i+1]; }
    for (int i = idx; i < n - 1; i++) for (int j = 0; j < n; j++) dist_mat[i][j] = dist_mat[i+1][j];
    for (int j = idx; j < n - 1; j++) for (int i = 0; i < n - 1; i++) dist_mat[i][j] = dist_mat[i][j+1];
    n--;
    status("Deleted city. Total: %d cities.", n);
}

static int hit_test_city(double mx, double my) {
    for (int i = n - 1; i >= 0; i--) {
        double dx = mx - cx[i], dy = my - cy[i];
        if (dx*dx + dy*dy <= (CITY_R + 4) * (CITY_R + 4)) return i;
    }
    return -1;
}

/* ============================================================
 * Animation control
 * ============================================================ */
static void start_animation(void) {
    if (timer_id) { g_source_remove(timer_id); timer_id = 0; }
    phase = PH_BASE; phase_t = 0; phase_dur = 1.8;
    build_level = 2; reveal_idx = 0; reveal_t = 0;
    last_tick_us = g_get_monotonic_time();
    timer_id = g_timeout_add(FPS_MS, on_anim_tick, NULL);
}

static void stop_animation(void) {
    if (timer_id) { g_source_remove(timer_id); timer_id = 0; }
    phase = PH_IDLE;
}

static void next_phase(void) {
    phase_t = 0;
    switch (phase) {
        case PH_BASE:
            phase = PH_BUILDUP; build_level = 3; phase_dur = 1.1;
            if (build_level > n) { phase = PH_CLOSING; phase_dur = 1.6; }
            break;
        case PH_BUILDUP:
            if (build_level < n) { build_level++; phase_dur = 1.1; }
            else { phase = PH_CLOSING; phase_dur = 1.6; }
            break;
        case PH_CLOSING:
            phase = PH_REVEAL; reveal_idx = 0; reveal_t = 0;
            phase_dur = 0.75 * (tour_len - 1);
            break;
        case PH_REVEAL:
            phase = PH_DONE;
            if (timer_id) { g_source_remove(timer_id); timer_id = 0; }
            break;
        default: break;
    }
}

static gboolean on_anim_tick(gpointer data) {
    (void)data;
    gint64 now = g_get_monotonic_time();
    double dt = (now - last_tick_us) / 1.0e6;
    last_tick_us = now;
    phase_t += dt * ANIM_SPEED;

    if (phase == PH_REVEAL) {
        reveal_t += dt * ANIM_SPEED / 0.75;
        if (reveal_t >= 1.0) {
            reveal_t = 0; reveal_idx++;
            if (reveal_idx >= tour_len - 1) reveal_idx = tour_len - 2;
        }
    }
    if (phase_t >= phase_dur && phase != PH_DONE && phase != PH_IDLE) next_phase();
    gtk_widget_queue_draw(canvas);
    return (phase == PH_DONE || phase == PH_IDLE) ? G_SOURCE_REMOVE : G_SOURCE_CONTINUE;
}

/* ============================================================
 * Drawing primitives for the visualization
 * ============================================================ */
static void draw_arrow(cairo_t *cr, double x1, double y1, double x2, double y2,
                       Color col, double width, gboolean head) {
    double dx = x2-x1, dy = y2-y1, len = sqrt(dx*dx + dy*dy);
    if (len < 1) return;
    double ux = dx/len, uy = dy/len;
    double sx1 = x1 + ux*CITY_R, sy1 = y1 + uy*CITY_R;
    double sx2 = x2 - ux*CITY_R, sy2 = y2 - uy*CITY_R;
    set_color(cr, col);
    cairo_set_line_width(cr, width); cairo_set_line_cap(cr, CAIRO_LINE_CAP_ROUND);
    cairo_move_to(cr, sx1, sy1); cairo_line_to(cr, sx2, sy2); cairo_stroke(cr);
    if (head) {
        double ang = atan2(dy, dx), ah = 10;
        cairo_save(cr); cairo_translate(cr, sx2, sy2); cairo_rotate(cr, ang);
        cairo_move_to(cr, 0, 0); cairo_line_to(cr, -ah, -ah*0.55);
        cairo_line_to(cr, -ah*0.7, 0); cairo_line_to(cr, -ah, ah*0.55);
        cairo_close_path(cr); cairo_fill(cr); cairo_restore(cr);
    }
}

static void draw_edge_label(cairo_t *cr, double x, double y, const char *txt, Color border) {
    int w, h; text_size(cr, "Sans Bold 12", txt, &w, &h);
    double pw = w + 14, ph = h + 6;
    cairo_set_source_rgba(cr, 1, 1, 1, 0.95);
    rounded_rect(cr, x-pw/2, y-ph/2, pw, ph, 4);
    cairo_fill_preserve(cr); set_color(cr, border); cairo_set_line_width(cr, 1.2); cairo_stroke(cr);
    draw_text_at(cr, x, y, "Sans Bold 12", C_TEXT, txt, 1);
}

static void draw_city(cairo_t *cr, int i, gboolean active) {
    Color fill = (i == 0) ? C_CITY_START : C_CITY;
    if (active) fill = C_CITY_ACT;
    if (active) {
        cairo_set_source_rgba(cr, fill.r, fill.g, fill.b, 0.22);
        cairo_arc(cr, cx[i], cy[i], CITY_R + 14, 0, 2*M_PI); cairo_fill(cr);
    }
    cairo_set_source_rgba(cr, 30/255.0, 41/255.0, 59/255.0, 0.18);
    cairo_arc(cr, cx[i]+2, cy[i]+3, CITY_R, 0, 2*M_PI); cairo_fill(cr);
    set_color(cr, fill);
    cairo_arc(cr, cx[i], cy[i], CITY_R, 0, 2*M_PI); cairo_fill_preserve(cr);
    cairo_set_source_rgba(cr, 1, 1, 1, 0.95); cairo_set_line_width(cr, 2.5); cairo_stroke(cr);
    char buf[8]; snprintf(buf, sizeof(buf), "%d", i);
    draw_text_at(cr, cx[i], cy[i], "Sans Bold 16", C_PANEL, buf, 1);
    if (i == 0) {
        set_color(cr, C_CITY_START);
        rounded_rect(cr, cx[i]-28, cy[i]-CITY_R-24, 56, 18, 4); cairo_fill(cr);
        draw_text_at(cr, cx[i], cy[i]-CITY_R-15, "Sans Bold 10", C_PANEL, "START", 1);
    }
}

static int example_subset_for_level(int level) {
    int s = 1;
    for (int i = 1; i < level; i++) s |= (1 << i);
    return s;
}

/* ============================================================
 * Canvas area: cities + animated edges
 * ============================================================ */
static void draw_canvas_area(cairo_t *cr, double x0, double y0, double w, double h) {
    set_color(cr, C_PANEL); rounded_rect(cr, x0, y0, w, h, 12); cairo_fill_preserve(cr);
    set_color(cr, C_BORD);  cairo_set_line_width(cr, 1); cairo_stroke(cr);

    cairo_save(cr); cairo_rectangle(cr, x0, y0, w, h); cairo_clip(cr);
    set_color(cr, C_GRID); cairo_set_line_width(cr, 0.7);
    for (double x = x0+40; x < x0+w; x += 40) { cairo_move_to(cr, x, y0); cairo_line_to(cr, x, y0+h); }
    for (double y = y0+40; y < y0+h; y += 40) { cairo_move_to(cr, x0, y); cairo_line_to(cr, x0+w, y); }
    cairo_stroke(cr); cairo_restore(cr);

    if (n == 0) {
        draw_text_at(cr, x0 + w/2, y0 + h/2 - 18, "Sans Bold 17", C_DIM,
                     "Click anywhere on this canvas to drop a city.", 1);
        draw_text_at(cr, x0 + w/2, y0 + h/2 + 6, "Sans 13", C_LIGHT,
                     "Add at least 2 cities, edit distances on the right, then click Solve TSP.", 1);
        draw_text_at(cr, x0 + w/2, y0 + h/2 + 28, "Sans 12 Italic", C_LIGHT,
                     "Right-click a city to remove it.", 1);
        return;
    }

    cairo_save(cr); cairo_rectangle(cr, x0, y0, w, h); cairo_clip(cr);

    if (n >= 2) {
        if (phase == PH_BASE) {
            double t = phase_t / phase_dur;
            for (int i = 1; i < n; i++) {
                Color c = C_WARN; c.a = 0.85 * ease_out(t);
                draw_arrow(cr, cx[0], cy[0], cx[i], cy[i], c, 2.6, FALSE);
                if (t > 0.5) {
                    char b[12]; snprintf(b, sizeof(b), "%d", dist_mat[0][i]);
                    draw_edge_label(cr, (cx[0]+cx[i])/2, (cy[0]+cy[i])/2, b, C_WARN);
                }
            }
        } else if (phase == PH_BUILDUP) {
            int s = example_subset_for_level(build_level);
            for (int i = 0; i < n; i++) {
                if (!(s & (1 << i))) continue;
                for (int j = i+1; j < n; j++) {
                    if (!(s & (1 << j))) continue;
                    Color c = C_LIGHT; c.a = 0.55;
                    draw_arrow(cr, cx[i], cy[i], cx[j], cy[j], c, 1.8, FALSE);
                }
            }
        } else if (phase == PH_CLOSING) {
            double t = ease_out(phase_t / phase_dur);
            Color faint = C_OK; faint.a = 0.25 + 0.45 * t;
            for (int k = 0; k < tour_len - 2; k++)
                draw_arrow(cr, cx[tour[k]], cy[tour[k]], cx[tour[k+1]], cy[tour[k+1]], faint, 3.0, FALSE);
            int from = tour[tour_len - 2];
            Color hi = C_DANGER; hi.a = t;
            draw_arrow(cr, cx[from], cy[from], cx[0], cy[0], hi, 4.2, TRUE);
            char b[32]; snprintf(b, sizeof(b), "close + %d", dist_mat[from][0]);
            draw_edge_label(cr, (cx[from]+cx[0])/2, (cy[from]+cy[0])/2, b, C_DANGER);
        } else if (phase == PH_REVEAL || phase == PH_DONE) {
            int max_idx = (phase == PH_DONE) ? tour_len - 1 : reveal_idx + 1;
            if (max_idx > tour_len - 1) max_idx = tour_len - 1;
            for (int k = 0; k < max_idx; k++) {
                double prog = (k < reveal_idx || phase == PH_DONE) ? 1.0 : ease_out(reveal_t);
                double x1 = cx[tour[k]], y1 = cy[tour[k]];
                double x2 = cx[tour[k+1]], y2 = cy[tour[k+1]];
                double ex = x1 + (x2-x1)*prog, ey = y1 + (y2-y1)*prog;
                draw_arrow(cr, x1, y1, ex, ey, C_OK, 4.2, prog > 0.95);
                if (prog > 0.95) {
                    char b[20]; snprintf(b, sizeof(b), "%d", dist_mat[tour[k]][tour[k+1]]);
                    draw_edge_label(cr, (x1+x2)/2, (y1+y2)/2, b, C_OK);
                    double dx2 = x2-x1, dy2 = y2-y1, ln = sqrt(dx2*dx2 + dy2*dy2);
                    if (ln > 0.001) {
                        double ox = x1 + dx2/ln * (CITY_R + 20);
                        double oy = y1 + dy2/ln * (CITY_R + 20);
                        set_color(cr, C_NAVY);
                        cairo_arc(cr, ox, oy, 13, 0, 2*M_PI); cairo_fill(cr);
                        char nb[8]; snprintf(nb, sizeof(nb), "%d", k + 1);
                        draw_text_at(cr, ox, oy, "Sans Bold 11", C_PANEL, nb, 1);
                    }
                }
            }
        }
    }

    int active_subset = (phase == PH_BUILDUP) ? example_subset_for_level(build_level) : 0;
    for (int i = 0; i < n; i++)
        draw_city(cr, i, (phase == PH_BUILDUP) && (active_subset & (1 << i)));
    cairo_restore(cr);
}

/* ============================================================
 * Panel area: editable matrix, status, cost, tour
 * ============================================================ */
static void draw_panel_area(cairo_t *cr, double x0, double y0, double w, double h) {
    set_color(cr, C_PANEL); rounded_rect(cr, x0, y0, w, h, 12); cairo_fill_preserve(cr);
    set_color(cr, C_BORD); cairo_set_line_width(cr, 1); cairo_stroke(cr);

    double y = y0 + 18;
    char buf[128];
    snprintf(buf, sizeof(buf), "DISTANCE MATRIX  (%d cities,  asymmetric,  click cell to edit)", n);
    draw_text_at(cr, x0 + 20, y, "Sans Bold 10", C_DIM, buf, 0);
    y += 18;

    if (n < 1) {
        draw_text_at(cr, x0 + 20, y + 8, "Sans 11 Italic", C_LIGHT,
                     "Add cities on the canvas to see the matrix.", 0);
        return;
    }

    int avail = (int)w - 40;
    mat_cell = (double)avail / (n + 1);
    if (mat_cell > 42) mat_cell = 42;
    if (mat_cell < 22) mat_cell = 22;
    mat_x = x0 + 20; mat_y = y;

    for (int j = 0; j < n; j++) {
        char b[6]; snprintf(b, sizeof(b), "%d", j);
        draw_text_at(cr, mat_x + (j+1)*mat_cell + mat_cell/2, mat_y + mat_cell/2, "Sans Bold 10", C_DIM, b, 1);
    }
    for (int i = 0; i < n; i++) {
        char b[6]; snprintf(b, sizeof(b), "%d", i);
        draw_text_at(cr, mat_x + mat_cell/2, mat_y + (i+1)*mat_cell + mat_cell/2, "Sans Bold 10", C_DIM, b, 1);
    }
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            double xx = mat_x + (j+1)*mat_cell, yy = mat_y + (i+1)*mat_cell;
            gboolean on_tour = FALSE;
            if (phase == PH_DONE || phase == PH_REVEAL) {
                for (int k = 0; k < tour_len - 1; k++)
                    if (tour[k]==i && tour[k+1]==j) { on_tour = TRUE; break; }
            }
            if (i == j)                              set_color(cr, C_GRID);
            else if (on_tour)                        set_color(cr, C_OK_BG);
            else if (i == sel_i && j == sel_j)       set_color(cr, C_ACC_BG);
            else                                     set_color(cr, C_PANEL);
            cairo_rectangle(cr, xx, yy, mat_cell, mat_cell); cairo_fill(cr);
            if (i == sel_i && j == sel_j) { set_color(cr, C_ACC); cairo_set_line_width(cr, 2.2); }
            else                          { set_color(cr, C_BORD); cairo_set_line_width(cr, 0.6); }
            cairo_rectangle(cr, xx, yy, mat_cell, mat_cell); cairo_stroke(cr);
            if (i != j) {
                char cb[8];
                if (i == sel_i && j == sel_j && input_buf[0]) snprintf(cb, sizeof(cb), "%s", input_buf);
                else snprintf(cb, sizeof(cb), "%d", dist_mat[i][j]);
                Color tc = on_tour ? C_OK : C_TEXT;
                if (i == sel_i && j == sel_j) tc = C_ACC;
                draw_text_at(cr, xx + mat_cell/2, yy + mat_cell/2, "Sans Bold 12", tc, cb, 1);
            }
        }
    }
    y = mat_y + (n + 1) * mat_cell + 18;

    /* Cost */
    set_color(cr, C_NAVY); rounded_rect(cr, x0 + 16, y, w - 32, 72, 8); cairo_fill(cr);
    draw_text_at(cr, x0 + 28, y + 10, "Sans Bold 10", C_NAVY_SUB, "OPTIMAL TOUR COST", 0);
    if (tour_cost > 0 && phase != PH_IDLE) snprintf(buf, sizeof(buf), "%d", tour_cost);
    else snprintf(buf, sizeof(buf), "-");
    draw_text_at(cr, x0 + 28, y + 26, "Sans Bold 32", C_PANEL, buf, 0);
    if (computed_ms > 0 && phase != PH_IDLE) {
        snprintf(buf, sizeof(buf), "Solved in %.2f ms", computed_ms);
        int tw, th; text_size(cr, "Sans 10", buf, &tw, &th);
        draw_text_at(cr, x0 + w - 28 - tw, y + 48, "Sans 10", C_NAVY_SUB, buf, 0);
    }
}

/* ============================================================
 * Main draw callback
 * ============================================================ */
static gboolean on_draw(GtkWidget *w, cairo_t *cr, gpointer data) {
    (void)data;
    int W = gtk_widget_get_allocated_width(w);
    int H = gtk_widget_get_allocated_height(w);
    cairo_set_antialias(cr, CAIRO_ANTIALIAS_BEST);
    set_color(cr, C_BG); cairo_paint(cr);

    set_color(cr, C_NAVY); cairo_rectangle(cr, 0, 0, W, HEADER_H); cairo_fill(cr);
    draw_text_at(cr, 24, 10, "Sans Bold 22", C_PANEL,    "Held-Karp TSP Visualizer", 0);
    draw_text_at(cr, 24, 44, "Sans 12",      C_NAVY_SUB, "Dynamic Programming with Bitmasking", 0);
    const char *tag = "Harpreet Kaur Gothra  |  USN: R24EI020";
    int tw, th; text_size(cr, "Sans 13", tag, &tw, &th);
    draw_text_at(cr, W - tw - 24, 28, "Sans 13", C_NAVY_SUB, tag, 0);

    double avail_y = HEADER_H + 14;
    double avail_h = H - HEADER_H - FOOTER_H - 28;
    if (avail_h < 200) avail_h = 200;
    double panel_x = W - PANEL_W - 14;
    canvas_x0 = 14; canvas_y0 = avail_y;
    canvas_w = panel_x - 28; canvas_h = avail_h;
    if (canvas_w < 300) canvas_w = 300;

    draw_canvas_area(cr, canvas_x0, canvas_y0, canvas_w, canvas_h);
    draw_panel_area(cr, panel_x, avail_y, PANEL_W, avail_h);
    return FALSE;
}

/* ============================================================
 * Input handling
 * ============================================================ */
static int hit_test_matrix(double mx, double my, int *oi, int *oj) {
    if (mat_cell < 1 || n < 1) return 0;
    if (mx < mat_x + mat_cell || my < mat_y + mat_cell) return 0;
    if (mx > mat_x + (n+1)*mat_cell || my > mat_y + (n+1)*mat_cell) return 0;
    int j = (int)((mx - mat_x - mat_cell) / mat_cell);
    int i = (int)((my - mat_y - mat_cell) / mat_cell);
    if (i < 0 || i >= n || j < 0 || j >= n || i == j) return 0;
    *oi = i; *oj = j; return 1;
}

static int on_canvas(double mx, double my) {
    return (mx >= canvas_x0 && mx <= canvas_x0 + canvas_w
         && my >= canvas_y0 && my <= canvas_y0 + canvas_h);
}

static void commit_input(void) {
    if (sel_i >= 0 && sel_j >= 0 && input_buf[0]) {
        int v = atoi(input_buf);
        if (v < 1) v = 1; if (v > 999) v = 999;
        dist_mat[sel_i][sel_j] = v;
        status("Updated dist[%d][%d] = %d. Click Solve TSP to recompute.", sel_i, sel_j, v);
    }
    input_buf[0] = '\0';
}

static gboolean on_press(GtkWidget *w, GdkEventButton *e, gpointer data) {
    (void)data;
    gtk_widget_grab_focus(w);
    commit_input();

    /* Right-click on a city: delete it */
    if (e->button == 3 && on_canvas(e->x, e->y)) {
        int hit = hit_test_city(e->x, e->y);
        if (hit >= 0) {
            stop_animation();
            tour_len = 0; tour_cost = 0; computed_ms = 0;
            delete_city(hit);
            sel_i = sel_j = -1;
            gtk_widget_queue_draw(canvas);
        }
        return TRUE;
    }

    /* Left-click on matrix cell: select for editing */
    int ci, cj;
    if (hit_test_matrix(e->x, e->y, &ci, &cj)) {
        if (phase != PH_IDLE) { stop_animation(); tour_len = 0; tour_cost = 0; }
        sel_i = ci; sel_j = cj; input_buf[0] = '\0';
        status("Editing dist[%d][%d] (current = %d). Type a number, press Enter.",
               ci, cj, dist_mat[ci][cj]);
        gtk_widget_queue_draw(canvas);
        return TRUE;
    }

    /* Left-click on canvas: add city (unless clicking on existing city) */
    if (e->button == 1 && on_canvas(e->x, e->y) && phase == PH_IDLE) {
        int hit = hit_test_city(e->x, e->y);
        if (hit < 0) {
            add_city(e->x, e->y);
            sel_i = sel_j = -1;
            gtk_widget_queue_draw(canvas);
            return TRUE;
        }
    }

    sel_i = sel_j = -1; gtk_widget_queue_draw(canvas);
    return TRUE;
}

static gboolean on_key_press(GtkWidget *w, GdkEventKey *e, gpointer data) {
    (void)w; (void)data;
    if (sel_i < 0) return FALSE;
    if (e->keyval >= '0' && e->keyval <= '9') {
        int len = strlen(input_buf);
        if (len < (int)sizeof(input_buf) - 1) {
            input_buf[len] = (char)e->keyval; input_buf[len + 1] = '\0';
            gtk_widget_queue_draw(canvas);
        }
        return TRUE;
    }
    if (e->keyval == GDK_KEY_BackSpace) {
        int len = strlen(input_buf);
        if (len > 0) { input_buf[len - 1] = '\0'; gtk_widget_queue_draw(canvas); }
        return TRUE;
    }
    if (e->keyval == GDK_KEY_Return || e->keyval == GDK_KEY_KP_Enter) {
        commit_input(); sel_i = sel_j = -1; gtk_widget_queue_draw(canvas); return TRUE;
    }
    if (e->keyval == GDK_KEY_Escape) {
        input_buf[0] = '\0'; sel_i = sel_j = -1; gtk_widget_queue_draw(canvas); return TRUE;
    }
    return FALSE;
}

/* ============================================================
 * Button callbacks
 * ============================================================ */
static void on_solve(GtkWidget *b, gpointer data) {
    (void)b; (void)data;
    commit_input(); sel_i = sel_j = -1;
    if (n < 2) { status("Need at least 2 cities to solve. Click on the canvas to add some."); return; }
    stop_animation();
    tour_cost = held_karp();
    reconstruct_tour(tour[0]);
    status("Held-Karp solved in %.2f ms. Starting animation...", computed_ms);
    start_animation();
    gtk_widget_grab_focus(canvas);
}

static void on_reset(GtkWidget *b, gpointer data) {
    (void)b; (void)data;
    stop_animation();
    n = 0; tour_len = 0; tour_cost = 0; computed_ms = 0;
    sel_i = sel_j = -1; input_buf[0] = '\0';
    status("Reset. Click anywhere on the canvas to add cities.");
    gtk_widget_queue_draw(canvas);
    gtk_widget_grab_focus(canvas);
}

/* ============================================================
 * CSS and main
 * ============================================================ */
static void load_css(void) {
    const char *css =
        "window { background-color: #f7f9fc; }"
        "button { background-image: none; background-color: #3b82f6; color: #fff;"
        "         border: none; border-radius: 6px; padding: 8px 18px; font-weight: 600; }"
        "button:hover  { background-color: #2563eb; }"
        "button:active { background-color: #1d4ed8; }"
        "button.danger { background-color: #dc2626; }"
        "button.danger:hover { background-color: #b91c1c; }";
    GtkCssProvider *p = gtk_css_provider_new();
    gtk_css_provider_load_from_data(p, css, -1, NULL);
    gtk_style_context_add_provider_for_screen(gdk_screen_get_default(),
        GTK_STYLE_PROVIDER(p), GTK_STYLE_PROVIDER_PRIORITY_APPLICATION);
    g_object_unref(p);
}

int main(int argc, char *argv[]) {
    gtk_init(&argc, &argv);
    load_css();

    GtkWidget *win = gtk_window_new(GTK_WINDOW_TOPLEVEL);
    gtk_window_set_title(GTK_WINDOW(win),
        "Held-Karp TSP Visualizer  |  Harpreet Kaur Gothra  |  R24EI020");
    gtk_window_set_default_size(GTK_WINDOW(win), 1400, 900);
    g_signal_connect(win, "destroy", G_CALLBACK(gtk_main_quit), NULL);

    GtkWidget *overlay = gtk_overlay_new();
    gtk_container_add(GTK_CONTAINER(win), overlay);

    canvas = gtk_drawing_area_new();
    gtk_widget_set_can_focus(canvas, TRUE);
    gtk_widget_add_events(canvas, GDK_BUTTON_PRESS_MASK | GDK_KEY_PRESS_MASK);
    g_signal_connect(canvas, "draw",               G_CALLBACK(on_draw),      NULL);
    g_signal_connect(canvas, "button-press-event", G_CALLBACK(on_press),     NULL);
    g_signal_connect(canvas, "key-press-event",    G_CALLBACK(on_key_press), NULL);
    gtk_container_add(GTK_CONTAINER(overlay), canvas);

    GtkWidget *bar = gtk_box_new(GTK_ORIENTATION_HORIZONTAL, 14);
    gtk_widget_set_halign(bar, GTK_ALIGN_CENTER);
    gtk_widget_set_valign(bar, GTK_ALIGN_END);
    gtk_widget_set_margin_bottom(bar, 18);

    GtkWidget *btn_solve = gtk_button_new_with_label("Solve TSP");
    gtk_widget_set_size_request(btn_solve, 160, 44);
    g_signal_connect(btn_solve, "clicked", G_CALLBACK(on_solve), NULL);
    gtk_box_pack_start(GTK_BOX(bar), btn_solve, FALSE, FALSE, 0);

    GtkWidget *btn_reset = gtk_button_new_with_label("Reset");
    gtk_style_context_add_class(gtk_widget_get_style_context(btn_reset), "danger");
    gtk_widget_set_size_request(btn_reset, 120, 44);
    g_signal_connect(btn_reset, "clicked", G_CALLBACK(on_reset), NULL);
    gtk_box_pack_start(GTK_BOX(bar), btn_reset, FALSE, FALSE, 0);

    gtk_overlay_add_overlay(GTK_OVERLAY(overlay), bar);

    gtk_widget_show_all(win);
    gtk_window_maximize(GTK_WINDOW(win));
    gtk_widget_grab_focus(canvas);
    gtk_main();
    return 0;
}