var va = Object.defineProperty;
var xa = (e, r, n) => r in e ? va(e, r, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[r] = n;
var Yt = (e, r, n) => xa(e, typeof r != "symbol" ? r + "" : r, n);
import { jsxs as i, jsx as t, Fragment as je } from "react/jsx-runtime";
import * as qe from "react";
import Ca, { createContext as Pn, useState as f, useCallback as Se, useContext as Dn, useMemo as wa, useEffect as oe, useRef as Sa } from "react";
import { useNavigate as Nn, Routes as ka, Route as Bt } from "react-router-dom";
import { Box as m, Typography as x, CircularProgress as le, Alert as Y, Card as F, CardContent as W, Chip as de, LinearProgress as Gt, Button as ae, Divider as zn, IconButton as Be, List as On, ListItem as Bn, ListItemText as _n, Accordion as Ea, AccordionSummary as Ia, Checkbox as Xr, AccordionDetails as $a, ListItemButton as Aa, ListItemIcon as Ta, Dialog as lt, DialogTitle as ct, DialogContent as dt, Paper as Pa, DialogActions as ht, Snackbar as Mn, TextField as K, FormControl as tr, InputLabel as rr, Select as nr, MenuItem as $e, DialogContentText as Rn, CardActionArea as Da, Grid as Ae, ToggleButtonGroup as Na, ToggleButton as Zr, Tooltip as Pe, TableContainer as nt, Table as at, TableHead as ot, TableRow as xe, TableCell as _, TableBody as st, Pagination as za, FormControlLabel as _t, Switch as Mt, Collapse as Oa, Link as Ba, Tabs as _a, Tab as Ma, InputAdornment as Zt, TablePagination as Ra, Autocomplete as La } from "@mui/material";
import { AppConfigBuilder as Wa, Text as H, GridLayout as ir, StatCard as Wt, Button as me, QwickApp as ja, ProductLogo as Fa, Dialog as wt, DialogTitle as St, DialogContent as kt, DialogActions as Et } from "@qwickapps/react-framework";
import { DataTable as Vl, StatCard as Hl } from "@qwickapps/react-framework";
import ne from "prop-types";
import Ua from "@emotion/styled";
import "@emotion/react";
import { isValidElementType as Ln, Memo as Va, ForwardRef as Ha } from "react-is";
const Ka = Wa.create().withName("Control Panel").withId("com.qwickapps.control-panel").withVersion("1.0.0").withDefaultTheme("dark").withDefaultPalette("cosmic").withThemeSwitcher(!0).withPaletteSwitcher(!0).withDisplay("standalone").build(), en = (e) => e, Ga = () => {
  let e = en;
  return {
    configure(r) {
      e = r;
    },
    generate(r) {
      return e(r);
    },
    reset() {
      e = en;
    }
  };
}, qa = Ga();
function Je(e, ...r) {
  const n = new URL(`https://mui.com/production-error/?code=${e}`);
  return r.forEach((a) => n.searchParams.append("args[]", a)), `Minified MUI error #${e}; visit ${n} for the full message.`;
}
function ut(e) {
  if (typeof e != "string")
    throw new Error(process.env.NODE_ENV !== "production" ? "MUI: `capitalize(string)` expects a string argument." : Je(7));
  return e.charAt(0).toUpperCase() + e.slice(1);
}
function Wn(e) {
  var r, n, a = "";
  if (typeof e == "string" || typeof e == "number") a += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var o = e.length;
    for (r = 0; r < o; r++) e[r] && (n = Wn(e[r])) && (a && (a += " "), a += n);
  } else for (n in e) e[n] && (a && (a += " "), a += n);
  return a;
}
function jn() {
  for (var e, r, n = 0, a = "", o = arguments.length; n < o; n++) (e = arguments[n]) && (r = Wn(e)) && (a && (a += " "), a += r);
  return a;
}
function Ja(e, r, n = void 0) {
  const a = {};
  for (const o in e) {
    const s = e[o];
    let l = "", c = !0;
    for (let h = 0; h < s.length; h += 1) {
      const u = s[h];
      u && (l += (c === !0 ? "" : " ") + r(u), c = !1, n && n[u] && (l += " " + n[u]));
    }
    a[o] = l;
  }
  return a;
}
function Ve(e) {
  if (typeof e != "object" || e === null)
    return !1;
  const r = Object.getPrototypeOf(e);
  return (r === null || r === Object.prototype || Object.getPrototypeOf(r) === null) && !(Symbol.toStringTag in e) && !(Symbol.iterator in e);
}
function Fn(e) {
  if (/* @__PURE__ */ qe.isValidElement(e) || Ln(e) || !Ve(e))
    return e;
  const r = {};
  return Object.keys(e).forEach((n) => {
    r[n] = Fn(e[n]);
  }), r;
}
function De(e, r, n = {
  clone: !0
}) {
  const a = n.clone ? {
    ...e
  } : e;
  return Ve(e) && Ve(r) && Object.keys(r).forEach((o) => {
    /* @__PURE__ */ qe.isValidElement(r[o]) || Ln(r[o]) ? a[o] = r[o] : Ve(r[o]) && // Avoid prototype pollution
    Object.prototype.hasOwnProperty.call(e, o) && Ve(e[o]) ? a[o] = De(e[o], r[o], n) : n.clone ? a[o] = Ve(r[o]) ? Fn(r[o]) : r[o] : a[o] = r[o];
  }), a;
}
function Ut(e, r) {
  return r ? De(e, r, {
    clone: !1
    // No need to clone deep, it's way faster.
  }) : e;
}
const Ye = process.env.NODE_ENV !== "production" ? ne.oneOfType([ne.number, ne.string, ne.object, ne.array]) : {};
function tn(e, r) {
  if (!e.containerQueries)
    return r;
  const n = Object.keys(r).filter((a) => a.startsWith("@container")).sort((a, o) => {
    var l, c;
    const s = /min-width:\s*([0-9.]+)/;
    return +(((l = a.match(s)) == null ? void 0 : l[1]) || 0) - +(((c = o.match(s)) == null ? void 0 : c[1]) || 0);
  });
  return n.length ? n.reduce((a, o) => {
    const s = r[o];
    return delete a[o], a[o] = s, a;
  }, {
    ...r
  }) : r;
}
function Qa(e, r) {
  return r === "@" || r.startsWith("@") && (e.some((n) => r.startsWith(`@${n}`)) || !!r.match(/^@\d/));
}
function Ya(e, r) {
  const n = r.match(/^@([^/]+)?\/?(.+)?$/);
  if (!n) {
    if (process.env.NODE_ENV !== "production")
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The provided shorthand ${`(${r})`} is invalid. The format should be \`@<breakpoint | number>\` or \`@<breakpoint | number>/<container>\`.
For example, \`@sm\` or \`@600\` or \`@40rem/sidebar\`.` : Je(18, `(${r})`));
    return null;
  }
  const [, a, o] = n, s = Number.isNaN(+a) ? a || 0 : +a;
  return e.containerQueries(o).up(s);
}
function Xa(e) {
  const r = (s, l) => s.replace("@media", l ? `@container ${l}` : "@container");
  function n(s, l) {
    s.up = (...c) => r(e.breakpoints.up(...c), l), s.down = (...c) => r(e.breakpoints.down(...c), l), s.between = (...c) => r(e.breakpoints.between(...c), l), s.only = (...c) => r(e.breakpoints.only(...c), l), s.not = (...c) => {
      const h = r(e.breakpoints.not(...c), l);
      return h.includes("not all and") ? h.replace("not all and ", "").replace("min-width:", "width<").replace("max-width:", "width>").replace("and", "or") : h;
    };
  }
  const a = {}, o = (s) => (n(a, s), a);
  return n(o), {
    ...e,
    containerQueries: o
  };
}
const lr = {
  xs: 0,
  // phone
  sm: 600,
  // tablet
  md: 900,
  // small laptop
  lg: 1200,
  // desktop
  xl: 1536
  // large screen
}, rn = {
  // Sorted ASC by size. That's important.
  // It can't be configured as it's used statically for propTypes.
  keys: ["xs", "sm", "md", "lg", "xl"],
  up: (e) => `@media (min-width:${lr[e]}px)`
}, Za = {
  containerQueries: (e) => ({
    up: (r) => {
      let n = typeof r == "number" ? r : lr[r] || r;
      return typeof n == "number" && (n = `${n}px`), e ? `@container ${e} (min-width:${n})` : `@container (min-width:${n})`;
    }
  })
};
function He(e, r, n) {
  const a = e.theme || {};
  if (Array.isArray(r)) {
    const s = a.breakpoints || rn;
    return r.reduce((l, c, h) => (l[s.up(s.keys[h])] = n(r[h]), l), {});
  }
  if (typeof r == "object") {
    const s = a.breakpoints || rn;
    return Object.keys(r).reduce((l, c) => {
      if (Qa(s.keys, c)) {
        const h = Ya(a.containerQueries ? a : Za, c);
        h && (l[h] = n(r[c], c));
      } else if (Object.keys(s.values || lr).includes(c)) {
        const h = s.up(c);
        l[h] = n(r[c], c);
      } else {
        const h = c;
        l[h] = r[h];
      }
      return l;
    }, {});
  }
  return n(r);
}
function eo(e = {}) {
  var n;
  return ((n = e.keys) == null ? void 0 : n.reduce((a, o) => {
    const s = e.up(o);
    return a[s] = {}, a;
  }, {})) || {};
}
function nn(e, r) {
  return e.reduce((n, a) => {
    const o = n[a];
    return (!o || Object.keys(o).length === 0) && delete n[a], n;
  }, r);
}
function cr(e, r, n = !0) {
  if (!r || typeof r != "string")
    return null;
  if (e && e.vars && n) {
    const a = `vars.${r}`.split(".").reduce((o, s) => o && o[s] ? o[s] : null, e);
    if (a != null)
      return a;
  }
  return r.split(".").reduce((a, o) => a && a[o] != null ? a[o] : null, e);
}
function ar(e, r, n, a = n) {
  let o;
  return typeof e == "function" ? o = e(n) : Array.isArray(e) ? o = e[n] || a : o = cr(e, n) || a, r && (o = r(o, a, e)), o;
}
function ge(e) {
  const {
    prop: r,
    cssProperty: n = e.prop,
    themeKey: a,
    transform: o
  } = e, s = (l) => {
    if (l[r] == null)
      return null;
    const c = l[r], h = l.theme, u = cr(h, a) || {};
    return He(l, c, (g) => {
      let v = ar(u, o, g);
      return g === v && typeof g == "string" && (v = ar(u, o, `${r}${g === "default" ? "" : ut(g)}`, g)), n === !1 ? v : {
        [n]: v
      };
    });
  };
  return s.propTypes = process.env.NODE_ENV !== "production" ? {
    [r]: Ye
  } : {}, s.filterProps = [r], s;
}
function to(e) {
  const r = {};
  return (n) => (r[n] === void 0 && (r[n] = e(n)), r[n]);
}
const ro = {
  m: "margin",
  p: "padding"
}, no = {
  t: "Top",
  r: "Right",
  b: "Bottom",
  l: "Left",
  x: ["Left", "Right"],
  y: ["Top", "Bottom"]
}, an = {
  marginX: "mx",
  marginY: "my",
  paddingX: "px",
  paddingY: "py"
}, ao = to((e) => {
  if (e.length > 2)
    if (an[e])
      e = an[e];
    else
      return [e];
  const [r, n] = e.split(""), a = ro[r], o = no[n] || "";
  return Array.isArray(o) ? o.map((s) => a + s) : [a + o];
}), dr = ["m", "mt", "mr", "mb", "ml", "mx", "my", "margin", "marginTop", "marginRight", "marginBottom", "marginLeft", "marginX", "marginY", "marginInline", "marginInlineStart", "marginInlineEnd", "marginBlock", "marginBlockStart", "marginBlockEnd"], hr = ["p", "pt", "pr", "pb", "pl", "px", "py", "padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "paddingX", "paddingY", "paddingInline", "paddingInlineStart", "paddingInlineEnd", "paddingBlock", "paddingBlockStart", "paddingBlockEnd"], oo = [...dr, ...hr];
function qt(e, r, n, a) {
  const o = cr(e, r, !0) ?? n;
  return typeof o == "number" || typeof o == "string" ? (s) => typeof s == "string" ? s : (process.env.NODE_ENV !== "production" && typeof s != "number" && console.error(`MUI: Expected ${a} argument to be a number or a string, got ${s}.`), typeof o == "string" ? o.startsWith("var(") && s === 0 ? 0 : o.startsWith("var(") && s === 1 ? o : `calc(${s} * ${o})` : o * s) : Array.isArray(o) ? (s) => {
    if (typeof s == "string")
      return s;
    const l = Math.abs(s);
    process.env.NODE_ENV !== "production" && (Number.isInteger(l) ? l > o.length - 1 && console.error([`MUI: The value provided (${l}) overflows.`, `The supported values are: ${JSON.stringify(o)}.`, `${l} > ${o.length - 1}, you need to add the missing values.`].join(`
`)) : console.error([`MUI: The \`theme.${r}\` array type cannot be combined with non integer values.You should either use an integer value that can be used as index, or define the \`theme.${r}\` as a number.`].join(`
`)));
    const c = o[l];
    return s >= 0 ? c : typeof c == "number" ? -c : typeof c == "string" && c.startsWith("var(") ? `calc(-1 * ${c})` : `-${c}`;
  } : typeof o == "function" ? o : (process.env.NODE_ENV !== "production" && console.error([`MUI: The \`theme.${r}\` value (${o}) is invalid.`, "It should be a number, an array or a function."].join(`
`)), () => {
  });
}
function Rr(e) {
  return qt(e, "spacing", 8, "spacing");
}
function Jt(e, r) {
  return typeof r == "string" || r == null ? r : e(r);
}
function so(e, r) {
  return (n) => e.reduce((a, o) => (a[o] = Jt(r, n), a), {});
}
function io(e, r, n, a) {
  if (!r.includes(n))
    return null;
  const o = ao(n), s = so(o, a), l = e[n];
  return He(e, l, s);
}
function Un(e, r) {
  const n = Rr(e.theme);
  return Object.keys(e).map((a) => io(e, r, a, n)).reduce(Ut, {});
}
function fe(e) {
  return Un(e, dr);
}
fe.propTypes = process.env.NODE_ENV !== "production" ? dr.reduce((e, r) => (e[r] = Ye, e), {}) : {};
fe.filterProps = dr;
function pe(e) {
  return Un(e, hr);
}
pe.propTypes = process.env.NODE_ENV !== "production" ? hr.reduce((e, r) => (e[r] = Ye, e), {}) : {};
pe.filterProps = hr;
process.env.NODE_ENV !== "production" && oo.reduce((e, r) => (e[r] = Ye, e), {});
function ur(...e) {
  const r = e.reduce((a, o) => (o.filterProps.forEach((s) => {
    a[s] = o;
  }), a), {}), n = (a) => Object.keys(a).reduce((o, s) => r[s] ? Ut(o, r[s](a)) : o, {});
  return n.propTypes = process.env.NODE_ENV !== "production" ? e.reduce((a, o) => Object.assign(a, o.propTypes), {}) : {}, n.filterProps = e.reduce((a, o) => a.concat(o.filterProps), []), n;
}
function Oe(e) {
  return typeof e != "number" ? e : `${e}px solid`;
}
function _e(e, r) {
  return ge({
    prop: e,
    themeKey: "borders",
    transform: r
  });
}
const lo = _e("border", Oe), co = _e("borderTop", Oe), ho = _e("borderRight", Oe), uo = _e("borderBottom", Oe), mo = _e("borderLeft", Oe), fo = _e("borderColor"), po = _e("borderTopColor"), go = _e("borderRightColor"), yo = _e("borderBottomColor"), bo = _e("borderLeftColor"), vo = _e("outline", Oe), xo = _e("outlineColor"), mr = (e) => {
  if (e.borderRadius !== void 0 && e.borderRadius !== null) {
    const r = qt(e.theme, "shape.borderRadius", 4, "borderRadius"), n = (a) => ({
      borderRadius: Jt(r, a)
    });
    return He(e, e.borderRadius, n);
  }
  return null;
};
mr.propTypes = process.env.NODE_ENV !== "production" ? {
  borderRadius: Ye
} : {};
mr.filterProps = ["borderRadius"];
ur(lo, co, ho, uo, mo, fo, po, go, yo, bo, mr, vo, xo);
const fr = (e) => {
  if (e.gap !== void 0 && e.gap !== null) {
    const r = qt(e.theme, "spacing", 8, "gap"), n = (a) => ({
      gap: Jt(r, a)
    });
    return He(e, e.gap, n);
  }
  return null;
};
fr.propTypes = process.env.NODE_ENV !== "production" ? {
  gap: Ye
} : {};
fr.filterProps = ["gap"];
const pr = (e) => {
  if (e.columnGap !== void 0 && e.columnGap !== null) {
    const r = qt(e.theme, "spacing", 8, "columnGap"), n = (a) => ({
      columnGap: Jt(r, a)
    });
    return He(e, e.columnGap, n);
  }
  return null;
};
pr.propTypes = process.env.NODE_ENV !== "production" ? {
  columnGap: Ye
} : {};
pr.filterProps = ["columnGap"];
const gr = (e) => {
  if (e.rowGap !== void 0 && e.rowGap !== null) {
    const r = qt(e.theme, "spacing", 8, "rowGap"), n = (a) => ({
      rowGap: Jt(r, a)
    });
    return He(e, e.rowGap, n);
  }
  return null;
};
gr.propTypes = process.env.NODE_ENV !== "production" ? {
  rowGap: Ye
} : {};
gr.filterProps = ["rowGap"];
const Co = ge({
  prop: "gridColumn"
}), wo = ge({
  prop: "gridRow"
}), So = ge({
  prop: "gridAutoFlow"
}), ko = ge({
  prop: "gridAutoColumns"
}), Eo = ge({
  prop: "gridAutoRows"
}), Io = ge({
  prop: "gridTemplateColumns"
}), $o = ge({
  prop: "gridTemplateRows"
}), Ao = ge({
  prop: "gridTemplateAreas"
}), To = ge({
  prop: "gridArea"
});
ur(fr, pr, gr, Co, wo, So, ko, Eo, Io, $o, Ao, To);
function It(e, r) {
  return r === "grey" ? r : e;
}
const Po = ge({
  prop: "color",
  themeKey: "palette",
  transform: It
}), Do = ge({
  prop: "bgcolor",
  cssProperty: "backgroundColor",
  themeKey: "palette",
  transform: It
}), No = ge({
  prop: "backgroundColor",
  themeKey: "palette",
  transform: It
});
ur(Po, Do, No);
function Te(e) {
  return e <= 1 && e !== 0 ? `${e * 100}%` : e;
}
const zo = ge({
  prop: "width",
  transform: Te
}), Lr = (e) => {
  if (e.maxWidth !== void 0 && e.maxWidth !== null) {
    const r = (n) => {
      var o, s, l, c, h;
      const a = ((l = (s = (o = e.theme) == null ? void 0 : o.breakpoints) == null ? void 0 : s.values) == null ? void 0 : l[n]) || lr[n];
      return a ? ((h = (c = e.theme) == null ? void 0 : c.breakpoints) == null ? void 0 : h.unit) !== "px" ? {
        maxWidth: `${a}${e.theme.breakpoints.unit}`
      } : {
        maxWidth: a
      } : {
        maxWidth: Te(n)
      };
    };
    return He(e, e.maxWidth, r);
  }
  return null;
};
Lr.filterProps = ["maxWidth"];
const Oo = ge({
  prop: "minWidth",
  transform: Te
}), Bo = ge({
  prop: "height",
  transform: Te
}), _o = ge({
  prop: "maxHeight",
  transform: Te
}), Mo = ge({
  prop: "minHeight",
  transform: Te
});
ge({
  prop: "size",
  cssProperty: "width",
  transform: Te
});
ge({
  prop: "size",
  cssProperty: "height",
  transform: Te
});
const Ro = ge({
  prop: "boxSizing"
});
ur(zo, Lr, Oo, Bo, _o, Mo, Ro);
const yr = {
  // borders
  border: {
    themeKey: "borders",
    transform: Oe
  },
  borderTop: {
    themeKey: "borders",
    transform: Oe
  },
  borderRight: {
    themeKey: "borders",
    transform: Oe
  },
  borderBottom: {
    themeKey: "borders",
    transform: Oe
  },
  borderLeft: {
    themeKey: "borders",
    transform: Oe
  },
  borderColor: {
    themeKey: "palette"
  },
  borderTopColor: {
    themeKey: "palette"
  },
  borderRightColor: {
    themeKey: "palette"
  },
  borderBottomColor: {
    themeKey: "palette"
  },
  borderLeftColor: {
    themeKey: "palette"
  },
  outline: {
    themeKey: "borders",
    transform: Oe
  },
  outlineColor: {
    themeKey: "palette"
  },
  borderRadius: {
    themeKey: "shape.borderRadius",
    style: mr
  },
  // palette
  color: {
    themeKey: "palette",
    transform: It
  },
  bgcolor: {
    themeKey: "palette",
    cssProperty: "backgroundColor",
    transform: It
  },
  backgroundColor: {
    themeKey: "palette",
    transform: It
  },
  // spacing
  p: {
    style: pe
  },
  pt: {
    style: pe
  },
  pr: {
    style: pe
  },
  pb: {
    style: pe
  },
  pl: {
    style: pe
  },
  px: {
    style: pe
  },
  py: {
    style: pe
  },
  padding: {
    style: pe
  },
  paddingTop: {
    style: pe
  },
  paddingRight: {
    style: pe
  },
  paddingBottom: {
    style: pe
  },
  paddingLeft: {
    style: pe
  },
  paddingX: {
    style: pe
  },
  paddingY: {
    style: pe
  },
  paddingInline: {
    style: pe
  },
  paddingInlineStart: {
    style: pe
  },
  paddingInlineEnd: {
    style: pe
  },
  paddingBlock: {
    style: pe
  },
  paddingBlockStart: {
    style: pe
  },
  paddingBlockEnd: {
    style: pe
  },
  m: {
    style: fe
  },
  mt: {
    style: fe
  },
  mr: {
    style: fe
  },
  mb: {
    style: fe
  },
  ml: {
    style: fe
  },
  mx: {
    style: fe
  },
  my: {
    style: fe
  },
  margin: {
    style: fe
  },
  marginTop: {
    style: fe
  },
  marginRight: {
    style: fe
  },
  marginBottom: {
    style: fe
  },
  marginLeft: {
    style: fe
  },
  marginX: {
    style: fe
  },
  marginY: {
    style: fe
  },
  marginInline: {
    style: fe
  },
  marginInlineStart: {
    style: fe
  },
  marginInlineEnd: {
    style: fe
  },
  marginBlock: {
    style: fe
  },
  marginBlockStart: {
    style: fe
  },
  marginBlockEnd: {
    style: fe
  },
  // display
  displayPrint: {
    cssProperty: !1,
    transform: (e) => ({
      "@media print": {
        display: e
      }
    })
  },
  display: {},
  overflow: {},
  textOverflow: {},
  visibility: {},
  whiteSpace: {},
  // flexbox
  flexBasis: {},
  flexDirection: {},
  flexWrap: {},
  justifyContent: {},
  alignItems: {},
  alignContent: {},
  order: {},
  flex: {},
  flexGrow: {},
  flexShrink: {},
  alignSelf: {},
  justifyItems: {},
  justifySelf: {},
  // grid
  gap: {
    style: fr
  },
  rowGap: {
    style: gr
  },
  columnGap: {
    style: pr
  },
  gridColumn: {},
  gridRow: {},
  gridAutoFlow: {},
  gridAutoColumns: {},
  gridAutoRows: {},
  gridTemplateColumns: {},
  gridTemplateRows: {},
  gridTemplateAreas: {},
  gridArea: {},
  // positions
  position: {},
  zIndex: {
    themeKey: "zIndex"
  },
  top: {},
  right: {},
  bottom: {},
  left: {},
  // shadows
  boxShadow: {
    themeKey: "shadows"
  },
  // sizing
  width: {
    transform: Te
  },
  maxWidth: {
    style: Lr
  },
  minWidth: {
    transform: Te
  },
  height: {
    transform: Te
  },
  maxHeight: {
    transform: Te
  },
  minHeight: {
    transform: Te
  },
  boxSizing: {},
  // typography
  font: {
    themeKey: "font"
  },
  fontFamily: {
    themeKey: "typography"
  },
  fontSize: {
    themeKey: "typography"
  },
  fontStyle: {
    themeKey: "typography"
  },
  fontWeight: {
    themeKey: "typography"
  },
  letterSpacing: {},
  textTransform: {},
  lineHeight: {},
  textAlign: {},
  typography: {
    cssProperty: !1,
    themeKey: "typography"
  }
};
function Lo(...e) {
  const r = e.reduce((a, o) => a.concat(Object.keys(o)), []), n = new Set(r);
  return e.every((a) => n.size === Object.keys(a).length);
}
function Wo(e, r) {
  return typeof e == "function" ? e(r) : e;
}
function jo() {
  function e(n, a, o, s) {
    const l = {
      [n]: a,
      theme: o
    }, c = s[n];
    if (!c)
      return {
        [n]: a
      };
    const {
      cssProperty: h = n,
      themeKey: u,
      transform: p,
      style: g
    } = c;
    if (a == null)
      return null;
    if (u === "typography" && a === "inherit")
      return {
        [n]: a
      };
    const v = cr(o, u) || {};
    return g ? g(l) : He(l, a, (b) => {
      let A = ar(v, p, b);
      return b === A && typeof b == "string" && (A = ar(v, p, `${n}${b === "default" ? "" : ut(b)}`, b)), h === !1 ? A : {
        [h]: A
      };
    });
  }
  function r(n) {
    const {
      sx: a,
      theme: o = {},
      nested: s
    } = n || {};
    if (!a)
      return null;
    const l = o.unstable_sxConfig ?? yr;
    function c(h) {
      let u = h;
      if (typeof h == "function")
        u = h(o);
      else if (typeof h != "object")
        return h;
      if (!u)
        return null;
      const p = eo(o.breakpoints), g = Object.keys(p);
      let v = p;
      return Object.keys(u).forEach((w) => {
        const b = Wo(u[w], o);
        if (b != null)
          if (typeof b == "object")
            if (l[w])
              v = Ut(v, e(w, b, o, l));
            else {
              const A = He({
                theme: o
              }, b, ($) => ({
                [w]: $
              }));
              Lo(A, b) ? v[w] = r({
                sx: b,
                theme: o,
                nested: !0
              }) : v = Ut(v, A);
            }
          else
            v = Ut(v, e(w, b, o, l));
      }), !s && o.modularCssLayers ? {
        "@layer sx": tn(o, nn(g, v))
      } : tn(o, nn(g, v));
    }
    return Array.isArray(a) ? a.map(c) : c(a);
  }
  return r;
}
const $t = jo();
$t.filterProps = ["sx"];
function Fo(e) {
  for (var r = 0, n, a = 0, o = e.length; o >= 4; ++a, o -= 4)
    n = e.charCodeAt(a) & 255 | (e.charCodeAt(++a) & 255) << 8 | (e.charCodeAt(++a) & 255) << 16 | (e.charCodeAt(++a) & 255) << 24, n = /* Math.imul(k, m): */
    (n & 65535) * 1540483477 + ((n >>> 16) * 59797 << 16), n ^= /* k >>> r: */
    n >>> 24, r = /* Math.imul(k, m): */
    (n & 65535) * 1540483477 + ((n >>> 16) * 59797 << 16) ^ /* Math.imul(h, m): */
    (r & 65535) * 1540483477 + ((r >>> 16) * 59797 << 16);
  switch (o) {
    case 3:
      r ^= (e.charCodeAt(a + 2) & 255) << 16;
    case 2:
      r ^= (e.charCodeAt(a + 1) & 255) << 8;
    case 1:
      r ^= e.charCodeAt(a) & 255, r = /* Math.imul(h, m): */
      (r & 65535) * 1540483477 + ((r >>> 16) * 59797 << 16);
  }
  return r ^= r >>> 13, r = /* Math.imul(h, m): */
  (r & 65535) * 1540483477 + ((r >>> 16) * 59797 << 16), ((r ^ r >>> 15) >>> 0).toString(36);
}
var Uo = {
  animationIterationCount: 1,
  aspectRatio: 1,
  borderImageOutset: 1,
  borderImageSlice: 1,
  borderImageWidth: 1,
  boxFlex: 1,
  boxFlexGroup: 1,
  boxOrdinalGroup: 1,
  columnCount: 1,
  columns: 1,
  flex: 1,
  flexGrow: 1,
  flexPositive: 1,
  flexShrink: 1,
  flexNegative: 1,
  flexOrder: 1,
  gridRow: 1,
  gridRowEnd: 1,
  gridRowSpan: 1,
  gridRowStart: 1,
  gridColumn: 1,
  gridColumnEnd: 1,
  gridColumnSpan: 1,
  gridColumnStart: 1,
  msGridRow: 1,
  msGridRowSpan: 1,
  msGridColumn: 1,
  msGridColumnSpan: 1,
  fontWeight: 1,
  lineHeight: 1,
  opacity: 1,
  order: 1,
  orphans: 1,
  scale: 1,
  tabSize: 1,
  widows: 1,
  zIndex: 1,
  zoom: 1,
  WebkitLineClamp: 1,
  // SVG-related properties
  fillOpacity: 1,
  floodOpacity: 1,
  stopOpacity: 1,
  strokeDasharray: 1,
  strokeDashoffset: 1,
  strokeMiterlimit: 1,
  strokeOpacity: 1,
  strokeWidth: 1
};
function Vo(e) {
  var r = /* @__PURE__ */ Object.create(null);
  return function(n) {
    return r[n] === void 0 && (r[n] = e(n)), r[n];
  };
}
var Ho = /[A-Z]|^ms/g, Ko = /_EMO_([^_]+?)_([^]*?)_EMO_/g, Vn = function(r) {
  return r.charCodeAt(1) === 45;
}, on = function(r) {
  return r != null && typeof r != "boolean";
}, wr = /* @__PURE__ */ Vo(function(e) {
  return Vn(e) ? e : e.replace(Ho, "-$&").toLowerCase();
}), sn = function(r, n) {
  switch (r) {
    case "animation":
    case "animationName":
      if (typeof n == "string")
        return n.replace(Ko, function(a, o, s) {
          return Ge = {
            name: o,
            styles: s,
            next: Ge
          }, o;
        });
  }
  return Uo[r] !== 1 && !Vn(r) && typeof n == "number" && n !== 0 ? n + "px" : n;
};
function or(e, r, n) {
  if (n == null)
    return "";
  var a = n;
  if (a.__emotion_styles !== void 0)
    return a;
  switch (typeof n) {
    case "boolean":
      return "";
    case "object": {
      var o = n;
      if (o.anim === 1)
        return Ge = {
          name: o.name,
          styles: o.styles,
          next: Ge
        }, o.name;
      var s = n;
      if (s.styles !== void 0) {
        var l = s.next;
        if (l !== void 0)
          for (; l !== void 0; )
            Ge = {
              name: l.name,
              styles: l.styles,
              next: Ge
            }, l = l.next;
        var c = s.styles + ";";
        return c;
      }
      return Go(e, r, n);
    }
  }
  var h = n;
  return h;
}
function Go(e, r, n) {
  var a = "";
  if (Array.isArray(n))
    for (var o = 0; o < n.length; o++)
      a += or(e, r, n[o]) + ";";
  else
    for (var s in n) {
      var l = n[s];
      if (typeof l != "object") {
        var c = l;
        on(c) && (a += wr(s) + ":" + sn(s, c) + ";");
      } else if (Array.isArray(l) && typeof l[0] == "string" && r == null)
        for (var h = 0; h < l.length; h++)
          on(l[h]) && (a += wr(s) + ":" + sn(s, l[h]) + ";");
      else {
        var u = or(e, r, l);
        switch (s) {
          case "animation":
          case "animationName": {
            a += wr(s) + ":" + u + ";";
            break;
          }
          default:
            a += s + "{" + u + "}";
        }
      }
    }
  return a;
}
var ln = /label:\s*([^\s;{]+)\s*(;|$)/g, Ge;
function qo(e, r, n) {
  if (e.length === 1 && typeof e[0] == "object" && e[0] !== null && e[0].styles !== void 0)
    return e[0];
  var a = !0, o = "";
  Ge = void 0;
  var s = e[0];
  if (s == null || s.raw === void 0)
    a = !1, o += or(n, r, s);
  else {
    var l = s;
    o += l[0];
  }
  for (var c = 1; c < e.length; c++)
    if (o += or(n, r, e[c]), a) {
      var h = s;
      o += h[c];
    }
  ln.lastIndex = 0;
  for (var u = "", p; (p = ln.exec(o)) !== null; )
    u += "-" + p[1];
  var g = Fo(o) + u;
  return {
    name: g,
    styles: o,
    next: Ge
  };
}
/**
 * @mui/styled-engine v7.3.7
 *
 * @license MIT
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
function Jo(e, r) {
  const n = Ua(e, r);
  return process.env.NODE_ENV !== "production" ? (...a) => {
    const o = typeof e == "string" ? `"${e}"` : "component";
    return a.length === 0 ? console.error([`MUI: Seems like you called \`styled(${o})()\` without a \`style\` argument.`, 'You must provide a `styles` argument: `styled("div")(styleYouForgotToPass)`.'].join(`
`)) : a.some((s) => s === void 0) && console.error(`MUI: the styled(${o})(...args) API requires all its args to be defined.`), n(...a);
  } : n;
}
function Qo(e, r) {
  Array.isArray(e.__emotion_styles) && (e.__emotion_styles = r(e.__emotion_styles));
}
const cn = [];
function it(e) {
  return cn[0] = e, qo(cn);
}
const Yo = (e) => {
  const r = Object.keys(e).map((n) => ({
    key: n,
    val: e[n]
  })) || [];
  return r.sort((n, a) => n.val - a.val), r.reduce((n, a) => ({
    ...n,
    [a.key]: a.val
  }), {});
};
function Xo(e) {
  const {
    // The breakpoint **start** at this value.
    // For instance with the first breakpoint xs: [xs, sm).
    values: r = {
      xs: 0,
      // phone
      sm: 600,
      // tablet
      md: 900,
      // small laptop
      lg: 1200,
      // desktop
      xl: 1536
      // large screen
    },
    unit: n = "px",
    step: a = 5,
    ...o
  } = e, s = Yo(r), l = Object.keys(s);
  function c(v) {
    return `@media (min-width:${typeof r[v] == "number" ? r[v] : v}${n})`;
  }
  function h(v) {
    return `@media (max-width:${(typeof r[v] == "number" ? r[v] : v) - a / 100}${n})`;
  }
  function u(v, w) {
    const b = l.indexOf(w);
    return `@media (min-width:${typeof r[v] == "number" ? r[v] : v}${n}) and (max-width:${(b !== -1 && typeof r[l[b]] == "number" ? r[l[b]] : w) - a / 100}${n})`;
  }
  function p(v) {
    return l.indexOf(v) + 1 < l.length ? u(v, l[l.indexOf(v) + 1]) : c(v);
  }
  function g(v) {
    const w = l.indexOf(v);
    return w === 0 ? c(l[1]) : w === l.length - 1 ? h(l[w]) : u(v, l[l.indexOf(v) + 1]).replace("@media", "@media not all and");
  }
  return {
    keys: l,
    values: s,
    up: c,
    down: h,
    between: u,
    only: p,
    not: g,
    unit: n,
    ...o
  };
}
const Zo = {
  borderRadius: 4
};
function Hn(e = 8, r = Rr({
  spacing: e
})) {
  if (e.mui)
    return e;
  const n = (...a) => (process.env.NODE_ENV !== "production" && (a.length <= 4 || console.error(`MUI: Too many arguments provided, expected between 0 and 4, got ${a.length}`)), (a.length === 0 ? [1] : a).map((s) => {
    const l = r(s);
    return typeof l == "number" ? `${l}px` : l;
  }).join(" "));
  return n.mui = !0, n;
}
function es(e, r) {
  var a;
  const n = this;
  if (n.vars) {
    if (!((a = n.colorSchemes) != null && a[e]) || typeof n.getColorSchemeSelector != "function")
      return {};
    let o = n.getColorSchemeSelector(e);
    return o === "&" ? r : ((o.includes("data-") || o.includes(".")) && (o = `*:where(${o.replace(/\s*&$/, "")}) &`), {
      [o]: r
    });
  }
  return n.palette.mode === e ? r : {};
}
function Kn(e = {}, ...r) {
  const {
    breakpoints: n = {},
    palette: a = {},
    spacing: o,
    shape: s = {},
    ...l
  } = e, c = Xo(n), h = Hn(o);
  let u = De({
    breakpoints: c,
    direction: "ltr",
    components: {},
    // Inject component definitions.
    palette: {
      mode: "light",
      ...a
    },
    spacing: h,
    shape: {
      ...Zo,
      ...s
    }
  }, l);
  return u = Xa(u), u.applyStyles = es, u = r.reduce((p, g) => De(p, g), u), u.unstable_sxConfig = {
    ...yr,
    ...l == null ? void 0 : l.unstable_sxConfig
  }, u.unstable_sx = function(g) {
    return $t({
      sx: g,
      theme: this
    });
  }, u;
}
const ts = {
  active: "active",
  checked: "checked",
  completed: "completed",
  disabled: "disabled",
  error: "error",
  expanded: "expanded",
  focused: "focused",
  focusVisible: "focusVisible",
  open: "open",
  readOnly: "readOnly",
  required: "required",
  selected: "selected"
};
function Wr(e, r, n = "Mui") {
  const a = ts[r];
  return a ? `${n}-${a}` : `${qa.generate(e)}-${r}`;
}
function rs(e, r, n = "Mui") {
  const a = {};
  return r.forEach((o) => {
    a[o] = Wr(e, o, n);
  }), a;
}
function Gn(e, r = "") {
  return e.displayName || e.name || r;
}
function dn(e, r, n) {
  const a = Gn(r);
  return e.displayName || (a !== "" ? `${n}(${a})` : n);
}
function ns(e) {
  if (e != null) {
    if (typeof e == "string")
      return e;
    if (typeof e == "function")
      return Gn(e, "Component");
    if (typeof e == "object")
      switch (e.$$typeof) {
        case Ha:
          return dn(e, e.render, "ForwardRef");
        case Va:
          return dn(e, e.type, "memo");
        default:
          return;
      }
  }
}
function qn(e) {
  const {
    variants: r,
    ...n
  } = e, a = {
    variants: r,
    style: it(n),
    isProcessed: !0
  };
  return a.style === n || r && r.forEach((o) => {
    typeof o.style != "function" && (o.style = it(o.style));
  }), a;
}
const as = Kn();
function Sr(e) {
  return e !== "ownerState" && e !== "theme" && e !== "sx" && e !== "as";
}
function rt(e, r) {
  return r && e && typeof e == "object" && e.styles && !e.styles.startsWith("@layer") && (e.styles = `@layer ${r}{${String(e.styles)}}`), e;
}
function os(e) {
  return e ? (r, n) => n[e] : null;
}
function ss(e, r, n) {
  e.theme = ds(e.theme) ? n : e.theme[r] || e.theme;
}
function er(e, r, n) {
  const a = typeof r == "function" ? r(e) : r;
  if (Array.isArray(a))
    return a.flatMap((o) => er(e, o, n));
  if (Array.isArray(a == null ? void 0 : a.variants)) {
    let o;
    if (a.isProcessed)
      o = n ? rt(a.style, n) : a.style;
    else {
      const {
        variants: s,
        ...l
      } = a;
      o = n ? rt(it(l), n) : l;
    }
    return Jn(e, a.variants, [o], n);
  }
  return a != null && a.isProcessed ? n ? rt(it(a.style), n) : a.style : n ? rt(it(a), n) : a;
}
function Jn(e, r, n = [], a = void 0) {
  var s;
  let o;
  e: for (let l = 0; l < r.length; l += 1) {
    const c = r[l];
    if (typeof c.props == "function") {
      if (o ?? (o = {
        ...e,
        ...e.ownerState,
        ownerState: e.ownerState
      }), !c.props(o))
        continue;
    } else
      for (const h in c.props)
        if (e[h] !== c.props[h] && ((s = e.ownerState) == null ? void 0 : s[h]) !== c.props[h])
          continue e;
    typeof c.style == "function" ? (o ?? (o = {
      ...e,
      ...e.ownerState,
      ownerState: e.ownerState
    }), n.push(a ? rt(it(c.style(o)), a) : c.style(o))) : n.push(a ? rt(it(c.style), a) : c.style);
  }
  return n;
}
function is(e = {}) {
  const {
    themeId: r,
    defaultTheme: n = as,
    rootShouldForwardProp: a = Sr,
    slotShouldForwardProp: o = Sr
  } = e;
  function s(c) {
    ss(c, r, n);
  }
  return (c, h = {}) => {
    Qo(c, (D) => D.filter((V) => V !== $t));
    const {
      name: u,
      slot: p,
      skipVariantsResolver: g,
      skipSx: v,
      // TODO v6: remove `lowercaseFirstLetter()` in the next major release
      // For more details: https://github.com/mui/material-ui/pull/37908
      overridesResolver: w = os(Qn(p)),
      ...b
    } = h, A = u && u.startsWith("Mui") || p ? "components" : "custom", $ = g !== void 0 ? g : (
      // TODO v6: remove `Root` in the next major release
      // For more details: https://github.com/mui/material-ui/pull/37908
      p && p !== "Root" && p !== "root" || !1
    ), N = v || !1;
    let O = Sr;
    p === "Root" || p === "root" ? O = a : p ? O = o : hs(c) && (O = void 0);
    const E = Jo(c, {
      shouldForwardProp: O,
      label: cs(u, p),
      ...b
    }), y = (D) => {
      if (D.__emotion_real === D)
        return D;
      if (typeof D == "function")
        return function(j) {
          return er(j, D, j.theme.modularCssLayers ? A : void 0);
        };
      if (Ve(D)) {
        const V = qn(D);
        return function(B) {
          return V.variants ? er(B, V, B.theme.modularCssLayers ? A : void 0) : B.theme.modularCssLayers ? rt(V.style, A) : V.style;
        };
      }
      return D;
    }, P = (...D) => {
      const V = [], j = D.map(y), B = [];
      if (V.push(s), u && w && B.push(function(z) {
        var he, G;
        const M = (G = (he = z.theme.components) == null ? void 0 : he[u]) == null ? void 0 : G.styleOverrides;
        if (!M)
          return null;
        const U = {};
        for (const be in M)
          U[be] = er(z, M[be], z.theme.modularCssLayers ? "theme" : void 0);
        return w(z, U);
      }), u && !$ && B.push(function(z) {
        var U, he;
        const C = z.theme, M = (he = (U = C == null ? void 0 : C.components) == null ? void 0 : U[u]) == null ? void 0 : he.variants;
        return M ? Jn(z, M, [], z.theme.modularCssLayers ? "theme" : void 0) : null;
      }), N || B.push($t), Array.isArray(j[0])) {
        const d = j.shift(), z = new Array(V.length).fill(""), C = new Array(B.length).fill("");
        let M;
        M = [...z, ...d, ...C], M.raw = [...z, ...d.raw, ...C], V.unshift(M);
      }
      const ce = [...V, ...j, ...B], R = E(...ce);
      return c.muiName && (R.muiName = c.muiName), process.env.NODE_ENV !== "production" && (R.displayName = ls(u, p, c)), R;
    };
    return E.withConfig && (P.withConfig = E.withConfig), P;
  };
}
function ls(e, r, n) {
  return e ? `${e}${ut(r || "")}` : `Styled(${ns(n)})`;
}
function cs(e, r) {
  let n;
  return process.env.NODE_ENV !== "production" && e && (n = `${e}-${Qn(r || "Root")}`), n;
}
function ds(e) {
  for (const r in e)
    return !1;
  return !0;
}
function hs(e) {
  return typeof e == "string" && // 96 is one less than the char code
  // for "a" so this is checking that
  // it's a lowercase character
  e.charCodeAt(0) > 96;
}
function Qn(e) {
  return e && e.charAt(0).toLowerCase() + e.slice(1);
}
function Pr(e, r, n = !1) {
  const a = {
    ...r
  };
  for (const o in e)
    if (Object.prototype.hasOwnProperty.call(e, o)) {
      const s = o;
      if (s === "components" || s === "slots")
        a[s] = {
          ...e[s],
          ...a[s]
        };
      else if (s === "componentsProps" || s === "slotProps") {
        const l = e[s], c = r[s];
        if (!c)
          a[s] = l || {};
        else if (!l)
          a[s] = c;
        else {
          a[s] = {
            ...c
          };
          for (const h in l)
            if (Object.prototype.hasOwnProperty.call(l, h)) {
              const u = h;
              a[s][u] = Pr(l[u], c[u], n);
            }
        }
      } else s === "className" && n && r.className ? a.className = jn(e == null ? void 0 : e.className, r == null ? void 0 : r.className) : s === "style" && n && r.style ? a.style = {
        ...e == null ? void 0 : e.style,
        ...r == null ? void 0 : r.style
      } : a[s] === void 0 && (a[s] = e[s]);
    }
  return a;
}
function us(e, r = Number.MIN_SAFE_INTEGER, n = Number.MAX_SAFE_INTEGER) {
  return Math.max(r, Math.min(e, n));
}
function jr(e, r = 0, n = 1) {
  return process.env.NODE_ENV !== "production" && (e < r || e > n) && console.error(`MUI: The value provided ${e} is out of range [${r}, ${n}].`), us(e, r, n);
}
function ms(e) {
  e = e.slice(1);
  const r = new RegExp(`.{1,${e.length >= 6 ? 2 : 1}}`, "g");
  let n = e.match(r);
  return n && n[0].length === 1 && (n = n.map((a) => a + a)), process.env.NODE_ENV !== "production" && e.length !== e.trim().length && console.error(`MUI: The color: "${e}" is invalid. Make sure the color input doesn't contain leading/trailing space.`), n ? `rgb${n.length === 4 ? "a" : ""}(${n.map((a, o) => o < 3 ? parseInt(a, 16) : Math.round(parseInt(a, 16) / 255 * 1e3) / 1e3).join(", ")})` : "";
}
function Qe(e) {
  if (e.type)
    return e;
  if (e.charAt(0) === "#")
    return Qe(ms(e));
  const r = e.indexOf("("), n = e.substring(0, r);
  if (!["rgb", "rgba", "hsl", "hsla", "color"].includes(n))
    throw new Error(process.env.NODE_ENV !== "production" ? `MUI: Unsupported \`${e}\` color.
The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().` : Je(9, e));
  let a = e.substring(r + 1, e.length - 1), o;
  if (n === "color") {
    if (a = a.split(" "), o = a.shift(), a.length === 4 && a[3].charAt(0) === "/" && (a[3] = a[3].slice(1)), !["srgb", "display-p3", "a98-rgb", "prophoto-rgb", "rec-2020"].includes(o))
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: unsupported \`${o}\` color space.
The following color spaces are supported: srgb, display-p3, a98-rgb, prophoto-rgb, rec-2020.` : Je(10, o));
  } else
    a = a.split(",");
  return a = a.map((s) => parseFloat(s)), {
    type: n,
    values: a,
    colorSpace: o
  };
}
const fs = (e) => {
  const r = Qe(e);
  return r.values.slice(0, 3).map((n, a) => r.type.includes("hsl") && a !== 0 ? `${n}%` : n).join(" ");
}, jt = (e, r) => {
  try {
    return fs(e);
  } catch {
    return r && process.env.NODE_ENV !== "production" && console.warn(r), e;
  }
};
function br(e) {
  const {
    type: r,
    colorSpace: n
  } = e;
  let {
    values: a
  } = e;
  return r.includes("rgb") ? a = a.map((o, s) => s < 3 ? parseInt(o, 10) : o) : r.includes("hsl") && (a[1] = `${a[1]}%`, a[2] = `${a[2]}%`), r.includes("color") ? a = `${n} ${a.join(" ")}` : a = `${a.join(", ")}`, `${r}(${a})`;
}
function Yn(e) {
  e = Qe(e);
  const {
    values: r
  } = e, n = r[0], a = r[1] / 100, o = r[2] / 100, s = a * Math.min(o, 1 - o), l = (u, p = (u + n / 30) % 12) => o - s * Math.max(Math.min(p - 3, 9 - p, 1), -1);
  let c = "rgb";
  const h = [Math.round(l(0) * 255), Math.round(l(8) * 255), Math.round(l(4) * 255)];
  return e.type === "hsla" && (c += "a", h.push(r[3])), br({
    type: c,
    values: h
  });
}
function Dr(e) {
  e = Qe(e);
  let r = e.type === "hsl" || e.type === "hsla" ? Qe(Yn(e)).values : e.values;
  return r = r.map((n) => (e.type !== "color" && (n /= 255), n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4)), Number((0.2126 * r[0] + 0.7152 * r[1] + 0.0722 * r[2]).toFixed(3));
}
function hn(e, r) {
  const n = Dr(e), a = Dr(r);
  return (Math.max(n, a) + 0.05) / (Math.min(n, a) + 0.05);
}
function Xn(e, r) {
  return e = Qe(e), r = jr(r), (e.type === "rgb" || e.type === "hsl") && (e.type += "a"), e.type === "color" ? e.values[3] = `/${r}` : e.values[3] = r, br(e);
}
function tt(e, r, n) {
  try {
    return Xn(e, r);
  } catch {
    return n && process.env.NODE_ENV !== "production" && console.warn(n), e;
  }
}
function vr(e, r) {
  if (e = Qe(e), r = jr(r), e.type.includes("hsl"))
    e.values[2] *= 1 - r;
  else if (e.type.includes("rgb") || e.type.includes("color"))
    for (let n = 0; n < 3; n += 1)
      e.values[n] *= 1 - r;
  return br(e);
}
function se(e, r, n) {
  try {
    return vr(e, r);
  } catch {
    return n && process.env.NODE_ENV !== "production" && console.warn(n), e;
  }
}
function xr(e, r) {
  if (e = Qe(e), r = jr(r), e.type.includes("hsl"))
    e.values[2] += (100 - e.values[2]) * r;
  else if (e.type.includes("rgb"))
    for (let n = 0; n < 3; n += 1)
      e.values[n] += (255 - e.values[n]) * r;
  else if (e.type.includes("color"))
    for (let n = 0; n < 3; n += 1)
      e.values[n] += (1 - e.values[n]) * r;
  return br(e);
}
function ie(e, r, n) {
  try {
    return xr(e, r);
  } catch {
    return n && process.env.NODE_ENV !== "production" && console.warn(n), e;
  }
}
function ps(e, r = 0.15) {
  return Dr(e) > 0.5 ? vr(e, r) : xr(e, r);
}
function Xt(e, r, n) {
  try {
    return ps(e, r);
  } catch {
    return e;
  }
}
const gs = /* @__PURE__ */ qe.createContext(void 0);
process.env.NODE_ENV !== "production" && (ne.node, ne.object);
function ys(e) {
  const {
    theme: r,
    name: n,
    props: a
  } = e;
  if (!r || !r.components || !r.components[n])
    return a;
  const o = r.components[n];
  return o.defaultProps ? Pr(o.defaultProps, a, r.components.mergeClassNameAndStyle) : !o.styleOverrides && !o.variants ? Pr(o, a, r.components.mergeClassNameAndStyle) : a;
}
function bs({
  props: e,
  name: r
}) {
  const n = qe.useContext(gs);
  return ys({
    props: e,
    name: r,
    theme: {
      components: n
    }
  });
}
const un = {
  theme: void 0
};
function vs(e) {
  let r, n;
  return function(o) {
    let s = r;
    return (s === void 0 || o.theme !== n) && (un.theme = o.theme, s = qn(e(un)), r = s, n = o.theme), s;
  };
}
function xs(e = "") {
  function r(...a) {
    if (!a.length)
      return "";
    const o = a[0];
    return typeof o == "string" && !o.match(/(#|\(|\)|(-?(\d*\.)?\d+)(px|em|%|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc))|^(-?(\d*\.)?\d+)$|(\d+ \d+ \d+)/) ? `, var(--${e ? `${e}-` : ""}${o}${r(...a.slice(1))})` : `, ${o}`;
  }
  return (a, ...o) => `var(--${e ? `${e}-` : ""}${a}${r(...o)})`;
}
const mn = (e, r, n, a = []) => {
  let o = e;
  r.forEach((s, l) => {
    l === r.length - 1 ? Array.isArray(o) ? o[Number(s)] = n : o && typeof o == "object" && (o[s] = n) : o && typeof o == "object" && (o[s] || (o[s] = a.includes(s) ? [] : {}), o = o[s]);
  });
}, Cs = (e, r, n) => {
  function a(o, s = [], l = []) {
    Object.entries(o).forEach(([c, h]) => {
      (!n || n && !n([...s, c])) && h != null && (typeof h == "object" && Object.keys(h).length > 0 ? a(h, [...s, c], Array.isArray(h) ? [...l, c] : l) : r([...s, c], h, l));
    });
  }
  a(e);
}, ws = (e, r) => typeof r == "number" ? ["lineHeight", "fontWeight", "opacity", "zIndex"].some((a) => e.includes(a)) || e[e.length - 1].toLowerCase().includes("opacity") ? r : `${r}px` : r;
function kr(e, r) {
  const {
    prefix: n,
    shouldSkipGeneratingVar: a
  } = r || {}, o = {}, s = {}, l = {};
  return Cs(
    e,
    (c, h, u) => {
      if ((typeof h == "string" || typeof h == "number") && (!a || !a(c, h))) {
        const p = `--${n ? `${n}-` : ""}${c.join("-")}`, g = ws(c, h);
        Object.assign(o, {
          [p]: g
        }), mn(s, c, `var(${p})`, u), mn(l, c, `var(${p}, ${g})`, u);
      }
    },
    (c) => c[0] === "vars"
    // skip 'vars/*' paths
  ), {
    css: o,
    vars: s,
    varsWithDefaults: l
  };
}
function Ss(e, r = {}) {
  const {
    getSelector: n = N,
    disableCssColorScheme: a,
    colorSchemeSelector: o,
    enableContrastVars: s
  } = r, {
    colorSchemes: l = {},
    components: c,
    defaultColorScheme: h = "light",
    ...u
  } = e, {
    vars: p,
    css: g,
    varsWithDefaults: v
  } = kr(u, r);
  let w = v;
  const b = {}, {
    [h]: A,
    ...$
  } = l;
  if (Object.entries($ || {}).forEach(([y, P]) => {
    const {
      vars: D,
      css: V,
      varsWithDefaults: j
    } = kr(P, r);
    w = De(w, j), b[y] = {
      css: V,
      vars: D
    };
  }), A) {
    const {
      css: y,
      vars: P,
      varsWithDefaults: D
    } = kr(A, r);
    w = De(w, D), b[h] = {
      css: y,
      vars: P
    };
  }
  function N(y, P) {
    var V, j;
    let D = o;
    if (o === "class" && (D = ".%s"), o === "data" && (D = "[data-%s]"), o != null && o.startsWith("data-") && !o.includes("%s") && (D = `[${o}="%s"]`), y) {
      if (D === "media")
        return e.defaultColorScheme === y ? ":root" : {
          [`@media (prefers-color-scheme: ${((j = (V = l[y]) == null ? void 0 : V.palette) == null ? void 0 : j.mode) || y})`]: {
            ":root": P
          }
        };
      if (D)
        return e.defaultColorScheme === y ? `:root, ${D.replace("%s", String(y))}` : D.replace("%s", String(y));
    }
    return ":root";
  }
  return {
    vars: w,
    generateThemeVars: () => {
      let y = {
        ...p
      };
      return Object.entries(b).forEach(([, {
        vars: P
      }]) => {
        y = De(y, P);
      }), y;
    },
    generateStyleSheets: () => {
      var B, ce;
      const y = [], P = e.defaultColorScheme || "light";
      function D(R, d) {
        Object.keys(d).length && y.push(typeof R == "string" ? {
          [R]: {
            ...d
          }
        } : R);
      }
      D(n(void 0, {
        ...g
      }), g);
      const {
        [P]: V,
        ...j
      } = b;
      if (V) {
        const {
          css: R
        } = V, d = (ce = (B = l[P]) == null ? void 0 : B.palette) == null ? void 0 : ce.mode, z = !a && d ? {
          colorScheme: d,
          ...R
        } : {
          ...R
        };
        D(n(P, {
          ...z
        }), z);
      }
      return Object.entries(j).forEach(([R, {
        css: d
      }]) => {
        var M, U;
        const z = (U = (M = l[R]) == null ? void 0 : M.palette) == null ? void 0 : U.mode, C = !a && z ? {
          colorScheme: z,
          ...d
        } : {
          ...d
        };
        D(n(R, {
          ...C
        }), C);
      }), s && y.push({
        ":root": {
          // use double underscore to indicate that these are private variables
          "--__l-threshold": "0.7",
          "--__l": "clamp(0, (l / var(--__l-threshold) - 1) * -infinity, 1)",
          "--__a": "clamp(0.87, (l / var(--__l-threshold) - 1) * -infinity, 1)"
          // 0.87 is the default alpha value for black text.
        }
      }), y;
    }
  };
}
function ks(e) {
  return function(n) {
    return e === "media" ? (process.env.NODE_ENV !== "production" && n !== "light" && n !== "dark" && console.error(`MUI: @media (prefers-color-scheme) supports only 'light' or 'dark', but receive '${n}'.`), `@media (prefers-color-scheme: ${n})`) : e ? e.startsWith("data-") && !e.includes("%s") ? `[${e}="${n}"] &` : e === "class" ? `.${n} &` : e === "data" ? `[data-${n}] &` : `${e.replace("%s", n)} &` : "&";
  };
}
const Ht = {
  black: "#000",
  white: "#fff"
}, Es = {
  50: "#fafafa",
  100: "#f5f5f5",
  200: "#eeeeee",
  300: "#e0e0e0",
  400: "#bdbdbd",
  500: "#9e9e9e",
  600: "#757575",
  700: "#616161",
  800: "#424242",
  900: "#212121",
  A100: "#f5f5f5",
  A200: "#eeeeee",
  A400: "#bdbdbd",
  A700: "#616161"
}, yt = {
  50: "#f3e5f5",
  200: "#ce93d8",
  300: "#ba68c8",
  400: "#ab47bc",
  500: "#9c27b0",
  700: "#7b1fa2"
}, bt = {
  300: "#e57373",
  400: "#ef5350",
  500: "#f44336",
  700: "#d32f2f",
  800: "#c62828"
}, Rt = {
  300: "#ffb74d",
  400: "#ffa726",
  500: "#ff9800",
  700: "#f57c00",
  900: "#e65100"
}, vt = {
  50: "#e3f2fd",
  200: "#90caf9",
  400: "#42a5f5",
  700: "#1976d2",
  800: "#1565c0"
}, xt = {
  300: "#4fc3f7",
  400: "#29b6f6",
  500: "#03a9f4",
  700: "#0288d1",
  900: "#01579b"
}, Ct = {
  300: "#81c784",
  400: "#66bb6a",
  500: "#4caf50",
  700: "#388e3c",
  800: "#2e7d32",
  900: "#1b5e20"
};
function Zn() {
  return {
    // The colors used to style the text.
    text: {
      // The most important text.
      primary: "rgba(0, 0, 0, 0.87)",
      // Secondary text.
      secondary: "rgba(0, 0, 0, 0.6)",
      // Disabled text have even lower visual prominence.
      disabled: "rgba(0, 0, 0, 0.38)"
    },
    // The color used to divide different elements.
    divider: "rgba(0, 0, 0, 0.12)",
    // The background colors used to style the surfaces.
    // Consistency between these values is important.
    background: {
      paper: Ht.white,
      default: Ht.white
    },
    // The colors used to style the action elements.
    action: {
      // The color of an active action like an icon button.
      active: "rgba(0, 0, 0, 0.54)",
      // The color of an hovered action.
      hover: "rgba(0, 0, 0, 0.04)",
      hoverOpacity: 0.04,
      // The color of a selected action.
      selected: "rgba(0, 0, 0, 0.08)",
      selectedOpacity: 0.08,
      // The color of a disabled action.
      disabled: "rgba(0, 0, 0, 0.26)",
      // The background color of a disabled action.
      disabledBackground: "rgba(0, 0, 0, 0.12)",
      disabledOpacity: 0.38,
      focus: "rgba(0, 0, 0, 0.12)",
      focusOpacity: 0.12,
      activatedOpacity: 0.12
    }
  };
}
const ea = Zn();
function ta() {
  return {
    text: {
      primary: Ht.white,
      secondary: "rgba(255, 255, 255, 0.7)",
      disabled: "rgba(255, 255, 255, 0.5)",
      icon: "rgba(255, 255, 255, 0.5)"
    },
    divider: "rgba(255, 255, 255, 0.12)",
    background: {
      paper: "#121212",
      default: "#121212"
    },
    action: {
      active: Ht.white,
      hover: "rgba(255, 255, 255, 0.08)",
      hoverOpacity: 0.08,
      selected: "rgba(255, 255, 255, 0.16)",
      selectedOpacity: 0.16,
      disabled: "rgba(255, 255, 255, 0.3)",
      disabledBackground: "rgba(255, 255, 255, 0.12)",
      disabledOpacity: 0.38,
      focus: "rgba(255, 255, 255, 0.12)",
      focusOpacity: 0.12,
      activatedOpacity: 0.24
    }
  };
}
const Nr = ta();
function fn(e, r, n, a) {
  const o = a.light || a, s = a.dark || a * 1.5;
  e[r] || (e.hasOwnProperty(n) ? e[r] = e[n] : r === "light" ? e.light = xr(e.main, o) : r === "dark" && (e.dark = vr(e.main, s)));
}
function pn(e, r, n, a, o) {
  const s = o.light || o, l = o.dark || o * 1.5;
  r[n] || (r.hasOwnProperty(a) ? r[n] = r[a] : n === "light" ? r.light = `color-mix(in ${e}, ${r.main}, #fff ${(s * 100).toFixed(0)}%)` : n === "dark" && (r.dark = `color-mix(in ${e}, ${r.main}, #000 ${(l * 100).toFixed(0)}%)`));
}
function Is(e = "light") {
  return e === "dark" ? {
    main: vt[200],
    light: vt[50],
    dark: vt[400]
  } : {
    main: vt[700],
    light: vt[400],
    dark: vt[800]
  };
}
function $s(e = "light") {
  return e === "dark" ? {
    main: yt[200],
    light: yt[50],
    dark: yt[400]
  } : {
    main: yt[500],
    light: yt[300],
    dark: yt[700]
  };
}
function As(e = "light") {
  return e === "dark" ? {
    main: bt[500],
    light: bt[300],
    dark: bt[700]
  } : {
    main: bt[700],
    light: bt[400],
    dark: bt[800]
  };
}
function Ts(e = "light") {
  return e === "dark" ? {
    main: xt[400],
    light: xt[300],
    dark: xt[700]
  } : {
    main: xt[700],
    light: xt[500],
    dark: xt[900]
  };
}
function Ps(e = "light") {
  return e === "dark" ? {
    main: Ct[400],
    light: Ct[300],
    dark: Ct[700]
  } : {
    main: Ct[800],
    light: Ct[500],
    dark: Ct[900]
  };
}
function Ds(e = "light") {
  return e === "dark" ? {
    main: Rt[400],
    light: Rt[300],
    dark: Rt[700]
  } : {
    main: "#ed6c02",
    // closest to orange[800] that pass 3:1.
    light: Rt[500],
    dark: Rt[900]
  };
}
function Ns(e) {
  return `oklch(from ${e} var(--__l) 0 h / var(--__a))`;
}
function Fr(e) {
  const {
    mode: r = "light",
    contrastThreshold: n = 3,
    tonalOffset: a = 0.2,
    colorSpace: o,
    ...s
  } = e, l = e.primary || Is(r), c = e.secondary || $s(r), h = e.error || As(r), u = e.info || Ts(r), p = e.success || Ps(r), g = e.warning || Ds(r);
  function v($) {
    if (o)
      return Ns($);
    const N = hn($, Nr.text.primary) >= n ? Nr.text.primary : ea.text.primary;
    if (process.env.NODE_ENV !== "production") {
      const O = hn($, N);
      O < 3 && console.error([`MUI: The contrast ratio of ${O}:1 for ${N} on ${$}`, "falls below the WCAG recommended absolute minimum contrast ratio of 3:1.", "https://www.w3.org/TR/2008/REC-WCAG20-20081211/#visual-audio-contrast-contrast"].join(`
`));
    }
    return N;
  }
  const w = ({
    color: $,
    name: N,
    mainShade: O = 500,
    lightShade: E = 300,
    darkShade: y = 700
  }) => {
    if ($ = {
      ...$
    }, !$.main && $[O] && ($.main = $[O]), !$.hasOwnProperty("main"))
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The color${N ? ` (${N})` : ""} provided to augmentColor(color) is invalid.
The color object needs to have a \`main\` property or a \`${O}\` property.` : Je(11, N ? ` (${N})` : "", O));
    if (typeof $.main != "string")
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The color${N ? ` (${N})` : ""} provided to augmentColor(color) is invalid.
\`color.main\` should be a string, but \`${JSON.stringify($.main)}\` was provided instead.

Did you intend to use one of the following approaches?

import { green } from "@mui/material/colors";

const theme1 = createTheme({ palette: {
  primary: green,
} });

const theme2 = createTheme({ palette: {
  primary: { main: green[500] },
} });` : Je(12, N ? ` (${N})` : "", JSON.stringify($.main)));
    return o ? (pn(o, $, "light", E, a), pn(o, $, "dark", y, a)) : (fn($, "light", E, a), fn($, "dark", y, a)), $.contrastText || ($.contrastText = v($.main)), $;
  };
  let b;
  return r === "light" ? b = Zn() : r === "dark" && (b = ta()), process.env.NODE_ENV !== "production" && (b || console.error(`MUI: The palette mode \`${r}\` is not supported.`)), De({
    // A collection of common colors.
    common: {
      ...Ht
    },
    // prevent mutable object.
    // The palette mode, can be light or dark.
    mode: r,
    // The colors used to represent primary interface elements for a user.
    primary: w({
      color: l,
      name: "primary"
    }),
    // The colors used to represent secondary interface elements for a user.
    secondary: w({
      color: c,
      name: "secondary",
      mainShade: "A400",
      lightShade: "A200",
      darkShade: "A700"
    }),
    // The colors used to represent interface elements that the user should be made aware of.
    error: w({
      color: h,
      name: "error"
    }),
    // The colors used to represent potentially dangerous actions or important messages.
    warning: w({
      color: g,
      name: "warning"
    }),
    // The colors used to present information to the user that is neutral and not necessarily important.
    info: w({
      color: u,
      name: "info"
    }),
    // The colors used to indicate the successful completion of an action that user triggered.
    success: w({
      color: p,
      name: "success"
    }),
    // The grey colors.
    grey: Es,
    // Used by `getContrastText()` to maximize the contrast between
    // the background and the text.
    contrastThreshold: n,
    // Takes a background color and returns the text color that maximizes the contrast.
    getContrastText: v,
    // Generate a rich color object.
    augmentColor: w,
    // Used by the functions below to shift a color's luminance by approximately
    // two indexes within its tonal palette.
    // E.g., shift from Red 500 to Red 300 or Red 700.
    tonalOffset: a,
    // The light and dark mode object.
    ...b
  }, s);
}
function zs(e) {
  const r = {};
  return Object.entries(e).forEach((a) => {
    const [o, s] = a;
    typeof s == "object" && (r[o] = `${s.fontStyle ? `${s.fontStyle} ` : ""}${s.fontVariant ? `${s.fontVariant} ` : ""}${s.fontWeight ? `${s.fontWeight} ` : ""}${s.fontStretch ? `${s.fontStretch} ` : ""}${s.fontSize || ""}${s.lineHeight ? `/${s.lineHeight} ` : ""}${s.fontFamily || ""}`);
  }), r;
}
function Os(e, r) {
  return {
    toolbar: {
      minHeight: 56,
      [e.up("xs")]: {
        "@media (orientation: landscape)": {
          minHeight: 48
        }
      },
      [e.up("sm")]: {
        minHeight: 64
      }
    },
    ...r
  };
}
function Bs(e) {
  return Math.round(e * 1e5) / 1e5;
}
const gn = {
  textTransform: "uppercase"
}, yn = '"Roboto", "Helvetica", "Arial", sans-serif';
function _s(e, r) {
  const {
    fontFamily: n = yn,
    // The default font size of the Material Specification.
    fontSize: a = 14,
    // px
    fontWeightLight: o = 300,
    fontWeightRegular: s = 400,
    fontWeightMedium: l = 500,
    fontWeightBold: c = 700,
    // Tell MUI what's the font-size on the html element.
    // 16px is the default font-size used by browsers.
    htmlFontSize: h = 16,
    // Apply the CSS properties to all the variants.
    allVariants: u,
    pxToRem: p,
    ...g
  } = typeof r == "function" ? r(e) : r;
  process.env.NODE_ENV !== "production" && (typeof a != "number" && console.error("MUI: `fontSize` is required to be a number."), typeof h != "number" && console.error("MUI: `htmlFontSize` is required to be a number."));
  const v = a / 14, w = p || (($) => `${$ / h * v}rem`), b = ($, N, O, E, y) => ({
    fontFamily: n,
    fontWeight: $,
    fontSize: w(N),
    // Unitless following https://meyerweb.com/eric/thoughts/2006/02/08/unitless-line-heights/
    lineHeight: O,
    // The letter spacing was designed for the Roboto font-family. Using the same letter-spacing
    // across font-families can cause issues with the kerning.
    ...n === yn ? {
      letterSpacing: `${Bs(E / N)}em`
    } : {},
    ...y,
    ...u
  }), A = {
    h1: b(o, 96, 1.167, -1.5),
    h2: b(o, 60, 1.2, -0.5),
    h3: b(s, 48, 1.167, 0),
    h4: b(s, 34, 1.235, 0.25),
    h5: b(s, 24, 1.334, 0),
    h6: b(l, 20, 1.6, 0.15),
    subtitle1: b(s, 16, 1.75, 0.15),
    subtitle2: b(l, 14, 1.57, 0.1),
    body1: b(s, 16, 1.5, 0.15),
    body2: b(s, 14, 1.43, 0.15),
    button: b(l, 14, 1.75, 0.4, gn),
    caption: b(s, 12, 1.66, 0.4),
    overline: b(s, 12, 2.66, 1, gn),
    // TODO v6: Remove handling of 'inherit' variant from the theme as it is already handled in Material UI's Typography component. Also, remember to remove the associated types.
    inherit: {
      fontFamily: "inherit",
      fontWeight: "inherit",
      fontSize: "inherit",
      lineHeight: "inherit",
      letterSpacing: "inherit"
    }
  };
  return De({
    htmlFontSize: h,
    pxToRem: w,
    fontFamily: n,
    fontSize: a,
    fontWeightLight: o,
    fontWeightRegular: s,
    fontWeightMedium: l,
    fontWeightBold: c,
    ...A
  }, g, {
    clone: !1
    // No need to clone deep
  });
}
const Ms = 0.2, Rs = 0.14, Ls = 0.12;
function ue(...e) {
  return [`${e[0]}px ${e[1]}px ${e[2]}px ${e[3]}px rgba(0,0,0,${Ms})`, `${e[4]}px ${e[5]}px ${e[6]}px ${e[7]}px rgba(0,0,0,${Rs})`, `${e[8]}px ${e[9]}px ${e[10]}px ${e[11]}px rgba(0,0,0,${Ls})`].join(",");
}
const Ws = ["none", ue(0, 2, 1, -1, 0, 1, 1, 0, 0, 1, 3, 0), ue(0, 3, 1, -2, 0, 2, 2, 0, 0, 1, 5, 0), ue(0, 3, 3, -2, 0, 3, 4, 0, 0, 1, 8, 0), ue(0, 2, 4, -1, 0, 4, 5, 0, 0, 1, 10, 0), ue(0, 3, 5, -1, 0, 5, 8, 0, 0, 1, 14, 0), ue(0, 3, 5, -1, 0, 6, 10, 0, 0, 1, 18, 0), ue(0, 4, 5, -2, 0, 7, 10, 1, 0, 2, 16, 1), ue(0, 5, 5, -3, 0, 8, 10, 1, 0, 3, 14, 2), ue(0, 5, 6, -3, 0, 9, 12, 1, 0, 3, 16, 2), ue(0, 6, 6, -3, 0, 10, 14, 1, 0, 4, 18, 3), ue(0, 6, 7, -4, 0, 11, 15, 1, 0, 4, 20, 3), ue(0, 7, 8, -4, 0, 12, 17, 2, 0, 5, 22, 4), ue(0, 7, 8, -4, 0, 13, 19, 2, 0, 5, 24, 4), ue(0, 7, 9, -4, 0, 14, 21, 2, 0, 5, 26, 4), ue(0, 8, 9, -5, 0, 15, 22, 2, 0, 6, 28, 5), ue(0, 8, 10, -5, 0, 16, 24, 2, 0, 6, 30, 5), ue(0, 8, 11, -5, 0, 17, 26, 2, 0, 6, 32, 5), ue(0, 9, 11, -5, 0, 18, 28, 2, 0, 7, 34, 6), ue(0, 9, 12, -6, 0, 19, 29, 2, 0, 7, 36, 6), ue(0, 10, 13, -6, 0, 20, 31, 3, 0, 8, 38, 7), ue(0, 10, 13, -6, 0, 21, 33, 3, 0, 8, 40, 7), ue(0, 10, 14, -6, 0, 22, 35, 3, 0, 8, 42, 7), ue(0, 11, 14, -7, 0, 23, 36, 3, 0, 9, 44, 8), ue(0, 11, 15, -7, 0, 24, 38, 3, 0, 9, 46, 8)], js = {
  // This is the most common easing curve.
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  // Objects enter the screen at full velocity from off-screen and
  // slowly decelerate to a resting point.
  easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
  // Objects leave the screen at full velocity. They do not decelerate when off-screen.
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  // The sharp curve is used by objects that may return to the screen at any time.
  sharp: "cubic-bezier(0.4, 0, 0.6, 1)"
}, Fs = {
  shortest: 150,
  shorter: 200,
  short: 250,
  // most basic recommended timing
  standard: 300,
  // this is to be used in complex animations
  complex: 375,
  // recommended when something is entering screen
  enteringScreen: 225,
  // recommended when something is leaving screen
  leavingScreen: 195
};
function bn(e) {
  return `${Math.round(e)}ms`;
}
function Us(e) {
  if (!e)
    return 0;
  const r = e / 36;
  return Math.min(Math.round((4 + 15 * r ** 0.25 + r / 5) * 10), 3e3);
}
function Vs(e) {
  const r = {
    ...js,
    ...e.easing
  }, n = {
    ...Fs,
    ...e.duration
  };
  return {
    getAutoHeightDuration: Us,
    create: (o = ["all"], s = {}) => {
      const {
        duration: l = n.standard,
        easing: c = r.easeInOut,
        delay: h = 0,
        ...u
      } = s;
      if (process.env.NODE_ENV !== "production") {
        const p = (v) => typeof v == "string", g = (v) => !Number.isNaN(parseFloat(v));
        !p(o) && !Array.isArray(o) && console.error('MUI: Argument "props" must be a string or Array.'), !g(l) && !p(l) && console.error(`MUI: Argument "duration" must be a number or a string but found ${l}.`), p(c) || console.error('MUI: Argument "easing" must be a string.'), !g(h) && !p(h) && console.error('MUI: Argument "delay" must be a number or a string.'), typeof s != "object" && console.error(["MUI: Secong argument of transition.create must be an object.", "Arguments should be either `create('prop1', options)` or `create(['prop1', 'prop2'], options)`"].join(`
`)), Object.keys(u).length !== 0 && console.error(`MUI: Unrecognized argument(s) [${Object.keys(u).join(",")}].`);
      }
      return (Array.isArray(o) ? o : [o]).map((p) => `${p} ${typeof l == "string" ? l : bn(l)} ${c} ${typeof h == "string" ? h : bn(h)}`).join(",");
    },
    ...e,
    easing: r,
    duration: n
  };
}
const Hs = {
  mobileStepper: 1e3,
  fab: 1050,
  speedDial: 1050,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500
};
function Ks(e) {
  return Ve(e) || typeof e > "u" || typeof e == "string" || typeof e == "boolean" || typeof e == "number" || Array.isArray(e);
}
function ra(e = {}) {
  const r = {
    ...e
  };
  function n(a) {
    const o = Object.entries(a);
    for (let s = 0; s < o.length; s++) {
      const [l, c] = o[s];
      !Ks(c) || l.startsWith("unstable_") ? delete a[l] : Ve(c) && (a[l] = {
        ...c
      }, n(a[l]));
    }
  }
  return n(r), `import { unstable_createBreakpoints as createBreakpoints, createTransitions } from '@mui/material/styles';

const theme = ${JSON.stringify(r, null, 2)};

theme.breakpoints = createBreakpoints(theme.breakpoints || {});
theme.transitions = createTransitions(theme.transitions || {});

export default theme;`;
}
function vn(e) {
  return typeof e == "number" ? `${(e * 100).toFixed(0)}%` : `calc((${e}) * 100%)`;
}
const Gs = (e) => {
  if (!Number.isNaN(+e))
    return +e;
  const r = e.match(/\d*\.?\d+/g);
  if (!r)
    return 0;
  let n = 0;
  for (let a = 0; a < r.length; a += 1)
    n += +r[a];
  return n;
};
function qs(e) {
  Object.assign(e, {
    alpha(r, n) {
      const a = this || e;
      return a.colorSpace ? `oklch(from ${r} l c h / ${typeof n == "string" ? `calc(${n})` : n})` : a.vars ? `rgba(${r.replace(/var\(--([^,\s)]+)(?:,[^)]+)?\)+/g, "var(--$1Channel)")} / ${typeof n == "string" ? `calc(${n})` : n})` : Xn(r, Gs(n));
    },
    lighten(r, n) {
      const a = this || e;
      return a.colorSpace ? `color-mix(in ${a.colorSpace}, ${r}, #fff ${vn(n)})` : xr(r, n);
    },
    darken(r, n) {
      const a = this || e;
      return a.colorSpace ? `color-mix(in ${a.colorSpace}, ${r}, #000 ${vn(n)})` : vr(r, n);
    }
  });
}
function zr(e = {}, ...r) {
  const {
    breakpoints: n,
    mixins: a = {},
    spacing: o,
    palette: s = {},
    transitions: l = {},
    typography: c = {},
    shape: h,
    colorSpace: u,
    ...p
  } = e;
  if (e.vars && // The error should throw only for the root theme creation because user is not allowed to use a custom node `vars`.
  // `generateThemeVars` is the closest identifier for checking that the `options` is a result of `createTheme` with CSS variables so that user can create new theme for nested ThemeProvider.
  e.generateThemeVars === void 0)
    throw new Error(process.env.NODE_ENV !== "production" ? "MUI: `vars` is a private field used for CSS variables support.\nPlease use another name or follow the [docs](https://mui.com/material-ui/customization/css-theme-variables/usage/) to enable the feature." : Je(20));
  const g = Fr({
    ...s,
    colorSpace: u
  }), v = Kn(e);
  let w = De(v, {
    mixins: Os(v.breakpoints, a),
    palette: g,
    // Don't use [...shadows] until you've verified its transpiled code is not invoking the iterator protocol.
    shadows: Ws.slice(),
    typography: _s(g, c),
    transitions: Vs(l),
    zIndex: {
      ...Hs
    }
  });
  if (w = De(w, p), w = r.reduce((b, A) => De(b, A), w), process.env.NODE_ENV !== "production") {
    const b = ["active", "checked", "completed", "disabled", "error", "expanded", "focused", "focusVisible", "required", "selected"], A = ($, N) => {
      let O;
      for (O in $) {
        const E = $[O];
        if (b.includes(O) && Object.keys(E).length > 0) {
          if (process.env.NODE_ENV !== "production") {
            const y = Wr("", O);
            console.error([`MUI: The \`${N}\` component increases the CSS specificity of the \`${O}\` internal state.`, "You can not override it like this: ", JSON.stringify($, null, 2), "", `Instead, you need to use the '&.${y}' syntax:`, JSON.stringify({
              root: {
                [`&.${y}`]: E
              }
            }, null, 2), "", "https://mui.com/r/state-classes-guide"].join(`
`));
          }
          $[O] = {};
        }
      }
    };
    Object.keys(w.components).forEach(($) => {
      const N = w.components[$].styleOverrides;
      N && $.startsWith("Mui") && A(N, $);
    });
  }
  return w.unstable_sxConfig = {
    ...yr,
    ...p == null ? void 0 : p.unstable_sxConfig
  }, w.unstable_sx = function(A) {
    return $t({
      sx: A,
      theme: this
    });
  }, w.toRuntimeSource = ra, qs(w), w;
}
function Js(e) {
  let r;
  return e < 1 ? r = 5.11916 * e ** 2 : r = 4.5 * Math.log(e + 1) + 2, Math.round(r * 10) / 1e3;
}
const Qs = [...Array(25)].map((e, r) => {
  if (r === 0)
    return "none";
  const n = Js(r);
  return `linear-gradient(rgba(255 255 255 / ${n}), rgba(255 255 255 / ${n}))`;
});
function na(e) {
  return {
    inputPlaceholder: e === "dark" ? 0.5 : 0.42,
    inputUnderline: e === "dark" ? 0.7 : 0.42,
    switchTrackDisabled: e === "dark" ? 0.2 : 0.12,
    switchTrack: e === "dark" ? 0.3 : 0.38
  };
}
function aa(e) {
  return e === "dark" ? Qs : [];
}
function Ys(e) {
  const {
    palette: r = {
      mode: "light"
    },
    // need to cast to avoid module augmentation test
    opacity: n,
    overlays: a,
    colorSpace: o,
    ...s
  } = e, l = Fr({
    ...r,
    colorSpace: o
  });
  return {
    palette: l,
    opacity: {
      ...na(l.mode),
      ...n
    },
    overlays: a || aa(l.mode),
    ...s
  };
}
function Xs(e) {
  var r;
  return !!e[0].match(/(cssVarPrefix|colorSchemeSelector|modularCssLayers|rootSelector|typography|mixins|breakpoints|direction|transitions)/) || !!e[0].match(/sxConfig$/) || // ends with sxConfig
  e[0] === "palette" && !!((r = e[1]) != null && r.match(/(mode|contrastThreshold|tonalOffset)/));
}
const Zs = (e) => [...[...Array(25)].map((r, n) => `--${e ? `${e}-` : ""}overlays-${n}`), `--${e ? `${e}-` : ""}palette-AppBar-darkBg`, `--${e ? `${e}-` : ""}palette-AppBar-darkColor`], ei = (e) => (r, n) => {
  const a = e.rootSelector || ":root", o = e.colorSchemeSelector;
  let s = o;
  if (o === "class" && (s = ".%s"), o === "data" && (s = "[data-%s]"), o != null && o.startsWith("data-") && !o.includes("%s") && (s = `[${o}="%s"]`), e.defaultColorScheme === r) {
    if (r === "dark") {
      const l = {};
      return Zs(e.cssVarPrefix).forEach((c) => {
        l[c] = n[c], delete n[c];
      }), s === "media" ? {
        [a]: n,
        "@media (prefers-color-scheme: dark)": {
          [a]: l
        }
      } : s ? {
        [s.replace("%s", r)]: l,
        [`${a}, ${s.replace("%s", r)}`]: n
      } : {
        [a]: {
          ...n,
          ...l
        }
      };
    }
    if (s && s !== "media")
      return `${a}, ${s.replace("%s", String(r))}`;
  } else if (r) {
    if (s === "media")
      return {
        [`@media (prefers-color-scheme: ${String(r)})`]: {
          [a]: n
        }
      };
    if (s)
      return s.replace("%s", String(r));
  }
  return a;
};
function ti(e, r) {
  r.forEach((n) => {
    e[n] || (e[n] = {});
  });
}
function S(e, r, n) {
  !e[r] && n && (e[r] = n);
}
function Ft(e) {
  return typeof e != "string" || !e.startsWith("hsl") ? e : Yn(e);
}
function Ue(e, r) {
  `${r}Channel` in e || (e[`${r}Channel`] = jt(Ft(e[r]), `MUI: Can't create \`palette.${r}Channel\` because \`palette.${r}\` is not one of these formats: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().
To suppress this warning, you need to explicitly provide the \`palette.${r}Channel\` as a string (in rgb format, for example "12 12 12") or undefined if you want to remove the channel token.`));
}
function ri(e) {
  return typeof e == "number" ? `${e}px` : typeof e == "string" || typeof e == "function" || Array.isArray(e) ? e : "8px";
}
const We = (e) => {
  try {
    return e();
  } catch {
  }
}, ni = (e = "mui") => xs(e);
function Er(e, r, n, a, o) {
  if (!n)
    return;
  n = n === !0 ? {} : n;
  const s = o === "dark" ? "dark" : "light";
  if (!a) {
    r[o] = Ys({
      ...n,
      palette: {
        mode: s,
        ...n == null ? void 0 : n.palette
      },
      colorSpace: e
    });
    return;
  }
  const {
    palette: l,
    ...c
  } = zr({
    ...a,
    palette: {
      mode: s,
      ...n == null ? void 0 : n.palette
    },
    colorSpace: e
  });
  return r[o] = {
    ...n,
    palette: l,
    opacity: {
      ...na(s),
      ...n == null ? void 0 : n.opacity
    },
    overlays: (n == null ? void 0 : n.overlays) || aa(s)
  }, c;
}
function ai(e = {}, ...r) {
  const {
    colorSchemes: n = {
      light: !0
    },
    defaultColorScheme: a,
    disableCssColorScheme: o = !1,
    cssVarPrefix: s = "mui",
    nativeColor: l = !1,
    shouldSkipGeneratingVar: c = Xs,
    colorSchemeSelector: h = n.light && n.dark ? "media" : void 0,
    rootSelector: u = ":root",
    ...p
  } = e, g = Object.keys(n)[0], v = a || (n.light && g !== "light" ? "light" : g), w = ni(s), {
    [v]: b,
    light: A,
    dark: $,
    ...N
  } = n, O = {
    ...N
  };
  let E = b;
  if ((v === "dark" && !("dark" in n) || v === "light" && !("light" in n)) && (E = !0), !E)
    throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The \`colorSchemes.${v}\` option is either missing or invalid.` : Je(21, v));
  let y;
  l && (y = "oklch");
  const P = Er(y, O, E, p, v);
  A && !O.light && Er(y, O, A, void 0, "light"), $ && !O.dark && Er(y, O, $, void 0, "dark");
  let D = {
    defaultColorScheme: v,
    ...P,
    cssVarPrefix: s,
    colorSchemeSelector: h,
    rootSelector: u,
    getCssVar: w,
    colorSchemes: O,
    font: {
      ...zs(P.typography),
      ...P.font
    },
    spacing: ri(p.spacing)
  };
  Object.keys(D.colorSchemes).forEach((R) => {
    const d = D.colorSchemes[R].palette, z = (M) => {
      const U = M.split("-"), he = U[1], G = U[2];
      return w(M, d[he][G]);
    };
    d.mode === "light" && (S(d.common, "background", "#fff"), S(d.common, "onBackground", "#000")), d.mode === "dark" && (S(d.common, "background", "#000"), S(d.common, "onBackground", "#fff"));
    function C(M, U, he) {
      if (y) {
        let G;
        return M === tt && (G = `transparent ${((1 - he) * 100).toFixed(0)}%`), M === se && (G = `#000 ${(he * 100).toFixed(0)}%`), M === ie && (G = `#fff ${(he * 100).toFixed(0)}%`), `color-mix(in ${y}, ${U}, ${G})`;
      }
      return M(U, he);
    }
    if (ti(d, ["Alert", "AppBar", "Avatar", "Button", "Chip", "FilledInput", "LinearProgress", "Skeleton", "Slider", "SnackbarContent", "SpeedDialAction", "StepConnector", "StepContent", "Switch", "TableCell", "Tooltip"]), d.mode === "light") {
      S(d.Alert, "errorColor", C(se, d.error.light, 0.6)), S(d.Alert, "infoColor", C(se, d.info.light, 0.6)), S(d.Alert, "successColor", C(se, d.success.light, 0.6)), S(d.Alert, "warningColor", C(se, d.warning.light, 0.6)), S(d.Alert, "errorFilledBg", z("palette-error-main")), S(d.Alert, "infoFilledBg", z("palette-info-main")), S(d.Alert, "successFilledBg", z("palette-success-main")), S(d.Alert, "warningFilledBg", z("palette-warning-main")), S(d.Alert, "errorFilledColor", We(() => d.getContrastText(d.error.main))), S(d.Alert, "infoFilledColor", We(() => d.getContrastText(d.info.main))), S(d.Alert, "successFilledColor", We(() => d.getContrastText(d.success.main))), S(d.Alert, "warningFilledColor", We(() => d.getContrastText(d.warning.main))), S(d.Alert, "errorStandardBg", C(ie, d.error.light, 0.9)), S(d.Alert, "infoStandardBg", C(ie, d.info.light, 0.9)), S(d.Alert, "successStandardBg", C(ie, d.success.light, 0.9)), S(d.Alert, "warningStandardBg", C(ie, d.warning.light, 0.9)), S(d.Alert, "errorIconColor", z("palette-error-main")), S(d.Alert, "infoIconColor", z("palette-info-main")), S(d.Alert, "successIconColor", z("palette-success-main")), S(d.Alert, "warningIconColor", z("palette-warning-main")), S(d.AppBar, "defaultBg", z("palette-grey-100")), S(d.Avatar, "defaultBg", z("palette-grey-400")), S(d.Button, "inheritContainedBg", z("palette-grey-300")), S(d.Button, "inheritContainedHoverBg", z("palette-grey-A100")), S(d.Chip, "defaultBorder", z("palette-grey-400")), S(d.Chip, "defaultAvatarColor", z("palette-grey-700")), S(d.Chip, "defaultIconColor", z("palette-grey-700")), S(d.FilledInput, "bg", "rgba(0, 0, 0, 0.06)"), S(d.FilledInput, "hoverBg", "rgba(0, 0, 0, 0.09)"), S(d.FilledInput, "disabledBg", "rgba(0, 0, 0, 0.12)"), S(d.LinearProgress, "primaryBg", C(ie, d.primary.main, 0.62)), S(d.LinearProgress, "secondaryBg", C(ie, d.secondary.main, 0.62)), S(d.LinearProgress, "errorBg", C(ie, d.error.main, 0.62)), S(d.LinearProgress, "infoBg", C(ie, d.info.main, 0.62)), S(d.LinearProgress, "successBg", C(ie, d.success.main, 0.62)), S(d.LinearProgress, "warningBg", C(ie, d.warning.main, 0.62)), S(d.Skeleton, "bg", y ? C(tt, d.text.primary, 0.11) : `rgba(${z("palette-text-primaryChannel")} / 0.11)`), S(d.Slider, "primaryTrack", C(ie, d.primary.main, 0.62)), S(d.Slider, "secondaryTrack", C(ie, d.secondary.main, 0.62)), S(d.Slider, "errorTrack", C(ie, d.error.main, 0.62)), S(d.Slider, "infoTrack", C(ie, d.info.main, 0.62)), S(d.Slider, "successTrack", C(ie, d.success.main, 0.62)), S(d.Slider, "warningTrack", C(ie, d.warning.main, 0.62));
      const M = y ? C(se, d.background.default, 0.6825) : Xt(d.background.default, 0.8);
      S(d.SnackbarContent, "bg", M), S(d.SnackbarContent, "color", We(() => y ? Nr.text.primary : d.getContrastText(M))), S(d.SpeedDialAction, "fabHoverBg", Xt(d.background.paper, 0.15)), S(d.StepConnector, "border", z("palette-grey-400")), S(d.StepContent, "border", z("palette-grey-400")), S(d.Switch, "defaultColor", z("palette-common-white")), S(d.Switch, "defaultDisabledColor", z("palette-grey-100")), S(d.Switch, "primaryDisabledColor", C(ie, d.primary.main, 0.62)), S(d.Switch, "secondaryDisabledColor", C(ie, d.secondary.main, 0.62)), S(d.Switch, "errorDisabledColor", C(ie, d.error.main, 0.62)), S(d.Switch, "infoDisabledColor", C(ie, d.info.main, 0.62)), S(d.Switch, "successDisabledColor", C(ie, d.success.main, 0.62)), S(d.Switch, "warningDisabledColor", C(ie, d.warning.main, 0.62)), S(d.TableCell, "border", C(ie, C(tt, d.divider, 1), 0.88)), S(d.Tooltip, "bg", C(tt, d.grey[700], 0.92));
    }
    if (d.mode === "dark") {
      S(d.Alert, "errorColor", C(ie, d.error.light, 0.6)), S(d.Alert, "infoColor", C(ie, d.info.light, 0.6)), S(d.Alert, "successColor", C(ie, d.success.light, 0.6)), S(d.Alert, "warningColor", C(ie, d.warning.light, 0.6)), S(d.Alert, "errorFilledBg", z("palette-error-dark")), S(d.Alert, "infoFilledBg", z("palette-info-dark")), S(d.Alert, "successFilledBg", z("palette-success-dark")), S(d.Alert, "warningFilledBg", z("palette-warning-dark")), S(d.Alert, "errorFilledColor", We(() => d.getContrastText(d.error.dark))), S(d.Alert, "infoFilledColor", We(() => d.getContrastText(d.info.dark))), S(d.Alert, "successFilledColor", We(() => d.getContrastText(d.success.dark))), S(d.Alert, "warningFilledColor", We(() => d.getContrastText(d.warning.dark))), S(d.Alert, "errorStandardBg", C(se, d.error.light, 0.9)), S(d.Alert, "infoStandardBg", C(se, d.info.light, 0.9)), S(d.Alert, "successStandardBg", C(se, d.success.light, 0.9)), S(d.Alert, "warningStandardBg", C(se, d.warning.light, 0.9)), S(d.Alert, "errorIconColor", z("palette-error-main")), S(d.Alert, "infoIconColor", z("palette-info-main")), S(d.Alert, "successIconColor", z("palette-success-main")), S(d.Alert, "warningIconColor", z("palette-warning-main")), S(d.AppBar, "defaultBg", z("palette-grey-900")), S(d.AppBar, "darkBg", z("palette-background-paper")), S(d.AppBar, "darkColor", z("palette-text-primary")), S(d.Avatar, "defaultBg", z("palette-grey-600")), S(d.Button, "inheritContainedBg", z("palette-grey-800")), S(d.Button, "inheritContainedHoverBg", z("palette-grey-700")), S(d.Chip, "defaultBorder", z("palette-grey-700")), S(d.Chip, "defaultAvatarColor", z("palette-grey-300")), S(d.Chip, "defaultIconColor", z("palette-grey-300")), S(d.FilledInput, "bg", "rgba(255, 255, 255, 0.09)"), S(d.FilledInput, "hoverBg", "rgba(255, 255, 255, 0.13)"), S(d.FilledInput, "disabledBg", "rgba(255, 255, 255, 0.12)"), S(d.LinearProgress, "primaryBg", C(se, d.primary.main, 0.5)), S(d.LinearProgress, "secondaryBg", C(se, d.secondary.main, 0.5)), S(d.LinearProgress, "errorBg", C(se, d.error.main, 0.5)), S(d.LinearProgress, "infoBg", C(se, d.info.main, 0.5)), S(d.LinearProgress, "successBg", C(se, d.success.main, 0.5)), S(d.LinearProgress, "warningBg", C(se, d.warning.main, 0.5)), S(d.Skeleton, "bg", y ? C(tt, d.text.primary, 0.13) : `rgba(${z("palette-text-primaryChannel")} / 0.13)`), S(d.Slider, "primaryTrack", C(se, d.primary.main, 0.5)), S(d.Slider, "secondaryTrack", C(se, d.secondary.main, 0.5)), S(d.Slider, "errorTrack", C(se, d.error.main, 0.5)), S(d.Slider, "infoTrack", C(se, d.info.main, 0.5)), S(d.Slider, "successTrack", C(se, d.success.main, 0.5)), S(d.Slider, "warningTrack", C(se, d.warning.main, 0.5));
      const M = y ? C(ie, d.background.default, 0.985) : Xt(d.background.default, 0.98);
      S(d.SnackbarContent, "bg", M), S(d.SnackbarContent, "color", We(() => y ? ea.text.primary : d.getContrastText(M))), S(d.SpeedDialAction, "fabHoverBg", Xt(d.background.paper, 0.15)), S(d.StepConnector, "border", z("palette-grey-600")), S(d.StepContent, "border", z("palette-grey-600")), S(d.Switch, "defaultColor", z("palette-grey-300")), S(d.Switch, "defaultDisabledColor", z("palette-grey-600")), S(d.Switch, "primaryDisabledColor", C(se, d.primary.main, 0.55)), S(d.Switch, "secondaryDisabledColor", C(se, d.secondary.main, 0.55)), S(d.Switch, "errorDisabledColor", C(se, d.error.main, 0.55)), S(d.Switch, "infoDisabledColor", C(se, d.info.main, 0.55)), S(d.Switch, "successDisabledColor", C(se, d.success.main, 0.55)), S(d.Switch, "warningDisabledColor", C(se, d.warning.main, 0.55)), S(d.TableCell, "border", C(se, C(tt, d.divider, 1), 0.68)), S(d.Tooltip, "bg", C(tt, d.grey[700], 0.92));
    }
    Ue(d.background, "default"), Ue(d.background, "paper"), Ue(d.common, "background"), Ue(d.common, "onBackground"), Ue(d, "divider"), Object.keys(d).forEach((M) => {
      const U = d[M];
      M !== "tonalOffset" && U && typeof U == "object" && (U.main && S(d[M], "mainChannel", jt(Ft(U.main))), U.light && S(d[M], "lightChannel", jt(Ft(U.light))), U.dark && S(d[M], "darkChannel", jt(Ft(U.dark))), U.contrastText && S(d[M], "contrastTextChannel", jt(Ft(U.contrastText))), M === "text" && (Ue(d[M], "primary"), Ue(d[M], "secondary")), M === "action" && (U.active && Ue(d[M], "active"), U.selected && Ue(d[M], "selected")));
    });
  }), D = r.reduce((R, d) => De(R, d), D);
  const V = {
    prefix: s,
    disableCssColorScheme: o,
    shouldSkipGeneratingVar: c,
    getSelector: ei(D),
    enableContrastVars: l
  }, {
    vars: j,
    generateThemeVars: B,
    generateStyleSheets: ce
  } = Ss(D, V);
  return D.vars = j, Object.entries(D.colorSchemes[D.defaultColorScheme]).forEach(([R, d]) => {
    D[R] = d;
  }), D.generateThemeVars = B, D.generateStyleSheets = ce, D.generateSpacing = function() {
    return Hn(p.spacing, Rr(this));
  }, D.getColorSchemeSelector = ks(h), D.spacing = D.generateSpacing(), D.shouldSkipGeneratingVar = c, D.unstable_sxConfig = {
    ...yr,
    ...p == null ? void 0 : p.unstable_sxConfig
  }, D.unstable_sx = function(d) {
    return $t({
      sx: d,
      theme: this
    });
  }, D.toRuntimeSource = ra, D;
}
function xn(e, r, n) {
  e.colorSchemes && n && (e.colorSchemes[r] = {
    ...n !== !0 && n,
    palette: Fr({
      ...n === !0 ? {} : n.palette,
      mode: r
    })
    // cast type to skip module augmentation test
  });
}
function oi(e = {}, ...r) {
  const {
    palette: n,
    cssVariables: a = !1,
    colorSchemes: o = n ? void 0 : {
      light: !0
    },
    defaultColorScheme: s = n == null ? void 0 : n.mode,
    ...l
  } = e, c = s || "light", h = o == null ? void 0 : o[c], u = {
    ...o,
    ...n ? {
      [c]: {
        ...typeof h != "boolean" && h,
        palette: n
      }
    } : void 0
  };
  if (a === !1) {
    if (!("colorSchemes" in e))
      return zr(e, ...r);
    let p = n;
    "palette" in e || u[c] && (u[c] !== !0 ? p = u[c].palette : c === "dark" && (p = {
      mode: "dark"
    }));
    const g = zr({
      ...e,
      palette: p
    }, ...r);
    return g.defaultColorScheme = c, g.colorSchemes = u, g.palette.mode === "light" && (g.colorSchemes.light = {
      ...u.light !== !0 && u.light,
      palette: g.palette
    }, xn(g, "dark", u.dark)), g.palette.mode === "dark" && (g.colorSchemes.dark = {
      ...u.dark !== !0 && u.dark,
      palette: g.palette
    }, xn(g, "light", u.light)), g;
  }
  return !n && !("light" in u) && c === "light" && (u.light = !0), ai({
    ...l,
    colorSchemes: u,
    defaultColorScheme: c,
    ...typeof a != "boolean" && a
  }, ...r);
}
const si = oi(), ii = "$$material";
function li(e) {
  return e !== "ownerState" && e !== "theme" && e !== "sx" && e !== "as";
}
const ci = (e) => li(e) && e !== "classes", di = is({
  themeId: ii,
  defaultTheme: si,
  rootShouldForwardProp: ci
}), hi = vs;
process.env.NODE_ENV !== "production" && (ne.node, ne.object.isRequired);
function ui(e) {
  return bs(e);
}
function mi(e) {
  return Wr("MuiSvgIcon", e);
}
rs("MuiSvgIcon", ["root", "colorPrimary", "colorSecondary", "colorAction", "colorError", "colorDisabled", "fontSizeInherit", "fontSizeSmall", "fontSizeMedium", "fontSizeLarge"]);
const fi = (e) => {
  const {
    color: r,
    fontSize: n,
    classes: a
  } = e, o = {
    root: ["root", r !== "inherit" && `color${ut(r)}`, `fontSize${ut(n)}`]
  };
  return Ja(o, mi, a);
}, pi = di("svg", {
  name: "MuiSvgIcon",
  slot: "Root",
  overridesResolver: (e, r) => {
    const {
      ownerState: n
    } = e;
    return [r.root, n.color !== "inherit" && r[`color${ut(n.color)}`], r[`fontSize${ut(n.fontSize)}`]];
  }
})(hi(({
  theme: e
}) => {
  var r, n, a, o, s, l, c, h, u, p, g, v, w, b;
  return {
    userSelect: "none",
    width: "1em",
    height: "1em",
    display: "inline-block",
    flexShrink: 0,
    transition: (o = (r = e.transitions) == null ? void 0 : r.create) == null ? void 0 : o.call(r, "fill", {
      duration: (a = (n = (e.vars ?? e).transitions) == null ? void 0 : n.duration) == null ? void 0 : a.shorter
    }),
    variants: [
      {
        props: (A) => !A.hasSvgAsChild,
        style: {
          // the <svg> will define the property that has `currentColor`
          // for example heroicons uses fill="none" and stroke="currentColor"
          fill: "currentColor"
        }
      },
      {
        props: {
          fontSize: "inherit"
        },
        style: {
          fontSize: "inherit"
        }
      },
      {
        props: {
          fontSize: "small"
        },
        style: {
          fontSize: ((l = (s = e.typography) == null ? void 0 : s.pxToRem) == null ? void 0 : l.call(s, 20)) || "1.25rem"
        }
      },
      {
        props: {
          fontSize: "medium"
        },
        style: {
          fontSize: ((h = (c = e.typography) == null ? void 0 : c.pxToRem) == null ? void 0 : h.call(c, 24)) || "1.5rem"
        }
      },
      {
        props: {
          fontSize: "large"
        },
        style: {
          fontSize: ((p = (u = e.typography) == null ? void 0 : u.pxToRem) == null ? void 0 : p.call(u, 35)) || "2.1875rem"
        }
      },
      // TODO v5 deprecate color prop, v6 remove for sx
      ...Object.entries((e.vars ?? e).palette).filter(([, A]) => A && A.main).map(([A]) => {
        var $, N;
        return {
          props: {
            color: A
          },
          style: {
            color: (N = ($ = (e.vars ?? e).palette) == null ? void 0 : $[A]) == null ? void 0 : N.main
          }
        };
      }),
      {
        props: {
          color: "action"
        },
        style: {
          color: (v = (g = (e.vars ?? e).palette) == null ? void 0 : g.action) == null ? void 0 : v.active
        }
      },
      {
        props: {
          color: "disabled"
        },
        style: {
          color: (b = (w = (e.vars ?? e).palette) == null ? void 0 : w.action) == null ? void 0 : b.disabled
        }
      },
      {
        props: {
          color: "inherit"
        },
        style: {
          color: void 0
        }
      }
    ]
  };
})), sr = /* @__PURE__ */ qe.forwardRef(function(r, n) {
  const a = ui({
    props: r,
    name: "MuiSvgIcon"
  }), {
    children: o,
    className: s,
    color: l = "inherit",
    component: c = "svg",
    fontSize: h = "medium",
    htmlColor: u,
    inheritViewBox: p = !1,
    titleAccess: g,
    viewBox: v = "0 0 24 24",
    ...w
  } = a, b = /* @__PURE__ */ qe.isValidElement(o) && o.type === "svg", A = {
    ...a,
    color: l,
    component: c,
    fontSize: h,
    instanceFontSize: r.fontSize,
    inheritViewBox: p,
    viewBox: v,
    hasSvgAsChild: b
  }, $ = {};
  p || ($.viewBox = v);
  const N = fi(A);
  return /* @__PURE__ */ i(pi, {
    as: c,
    className: jn(N.root, s),
    focusable: "false",
    color: u,
    "aria-hidden": g ? void 0 : !0,
    role: g ? "img" : void 0,
    ref: n,
    ...$,
    ...w,
    ...b && o.props,
    ownerState: A,
    children: [b ? o.props.children : o, g ? /* @__PURE__ */ t("title", {
      children: g
    }) : null]
  });
});
process.env.NODE_ENV !== "production" && (sr.propTypes = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Node passed into the SVG element.
   */
  children: ne.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: ne.object,
  /**
   * @ignore
   */
  className: ne.string,
  /**
   * The color of the component.
   * It supports both default and custom theme colors, which can be added as shown in the
   * [palette customization guide](https://mui.com/material-ui/customization/palette/#custom-colors).
   * You can use the `htmlColor` prop to apply a color attribute to the SVG element.
   * @default 'inherit'
   */
  color: ne.oneOfType([ne.oneOf(["inherit", "action", "disabled", "primary", "secondary", "error", "info", "success", "warning"]), ne.string]),
  /**
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: ne.elementType,
  /**
   * The fontSize applied to the icon. Defaults to 24px, but can be configure to inherit font size.
   * @default 'medium'
   */
  fontSize: ne.oneOfType([ne.oneOf(["inherit", "large", "medium", "small"]), ne.string]),
  /**
   * Applies a color attribute to the SVG element.
   */
  htmlColor: ne.string,
  /**
   * If `true`, the root node will inherit the custom `component`'s viewBox and the `viewBox`
   * prop will be ignored.
   * Useful when you want to reference a custom `component` and have `SvgIcon` pass that
   * `component`'s viewBox to the root node.
   * @default false
   */
  inheritViewBox: ne.bool,
  /**
   * The shape-rendering attribute. The behavior of the different options is described on the
   * [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/shape-rendering).
   * If you are having issues with blurry icons you should investigate this prop.
   */
  shapeRendering: ne.string,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: ne.oneOfType([ne.arrayOf(ne.oneOfType([ne.func, ne.object, ne.bool])), ne.func, ne.object]),
  /**
   * Provides a human-readable title for the element that contains it.
   * https://www.w3.org/TR/SVG-access/#Equivalent
   */
  titleAccess: ne.string,
  /**
   * Allows you to redefine what the coordinates without units mean inside an SVG element.
   * For example, if the SVG element is 500 (width) by 200 (height),
   * and you pass viewBox="0 0 50 20",
   * this means that the coordinates inside the SVG will go from the top left corner (0,0)
   * to bottom right (50,20) and each unit will be worth 10px.
   * @default '0 0 24 24'
   */
  viewBox: ne.string
});
sr.muiName = "SvgIcon";
function te(e, r) {
  function n(a, o) {
    return /* @__PURE__ */ t(sr, {
      "data-testid": process.env.NODE_ENV !== "production" ? `${r}Icon` : void 0,
      ref: o,
      ...a,
      children: e
    });
  }
  return process.env.NODE_ENV !== "production" && (n.displayName = `${r}Icon`), n.muiName = sr.muiName, /* @__PURE__ */ qe.memo(/* @__PURE__ */ qe.forwardRef(n));
}
const Me = te(/* @__PURE__ */ t("path", {
  d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8z"
}), "CheckCircle"), Ne = te(/* @__PURE__ */ t("path", {
  d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m1 15h-2v-2h2zm0-4h-2V7h2z"
}), "Error"), Kt = te(/* @__PURE__ */ t("path", {
  d: "M1 21h22L12 2zm12-3h-2v-2h2zm0-4h-2v-4h2z"
}), "Warning");
async function gi(e) {
  const r = `${e}/api/client-manifest`, n = await fetch(r);
  if (!n.ok)
    throw new Error(
      `Failed to fetch client manifest: ${n.status} ${n.statusText}`
    );
  const a = await n.json(), o = {};
  for (const [s, l] of Object.entries(a.routes)) {
    const [c, h] = s.split(".");
    if (!c || !h) {
      console.warn(`Invalid route key: ${s}, skipping`);
      continue;
    }
    const u = c.replace(/-./g, (p) => p[1].toUpperCase());
    o[u] || (o[u] = {}), o[u][h] = yi(
      e,
      l.method,
      l.path
    );
  }
  return o;
}
function yi(e, r, n) {
  return async (a) => {
    const o = bi(e, n, a, r), s = {
      method: r,
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "same-origin"
      // Required for Basic Auth support
    };
    if (r !== "GET" && a)
      if (!n.includes(":"))
        s.body = JSON.stringify(a);
      else {
        const h = Or(n), u = Object.keys(a).filter((p) => !h.includes(p)).reduce((p, g) => (p[g] = a[g], p), {});
        Object.keys(u).length > 0 && (s.body = JSON.stringify(u));
      }
    const l = await fetch(o, s);
    if (!l.ok)
      throw new Error(`API request failed: ${l.status} ${l.statusText}`);
    return l.json();
  };
}
function bi(e, r, n, a) {
  let o = r;
  if (n && r.includes(":")) {
    const s = Or(r);
    for (const l of s)
      n[l] !== void 0 && (o = o.replace(`:${l}`, encodeURIComponent(n[l])));
  }
  if (a === "GET" && n) {
    const s = r.includes(":") ? Or(r) : [], l = Object.keys(n).filter((c) => !s.includes(c)).reduce((c, h) => (c[h] = n[h], c), {});
    if (Object.keys(l).length > 0) {
      const c = new URLSearchParams();
      for (const [h, u] of Object.entries(l))
        u != null && c.append(h, String(u));
      o += `?${c.toString()}`;
    }
  }
  return `${e}${o}`;
}
function Or(e) {
  const r = e.match(/:([a-zA-Z0-9_]+)/g);
  return r ? r.map((n) => n.slice(1)) : [];
}
class vi {
  constructor(r = "") {
    Yt(this, "baseUrl");
    Yt(this, "client", null);
    Yt(this, "clientPromise", null);
    this.baseUrl = r;
  }
  /**
   * Ensure the API client is initialized.
   * Lazy-loads the client on first use by fetching the manifest.
   */
  async ensureClient() {
    if (this.client)
      return this.client;
    if (this.clientPromise)
      return this.clientPromise;
    this.clientPromise = gi(this.baseUrl);
    try {
      return this.client = await this.clientPromise, this.client;
    } catch (r) {
      throw this.clientPromise = null, r;
    }
  }
  /**
   * Set the base URL for API requests.
   * Call this when the control panel is mounted at a custom path.
   * Invalidates the cached client since the manifest will be different.
   */
  setBaseUrl(r) {
    this.baseUrl = r, this.client = null, this.clientPromise = null;
  }
  /**
   * Get the base URL for API requests.
   */
  getBaseUrl() {
    return this.baseUrl;
  }
  /**
   * Internal fetch wrapper that includes credentials for Basic Auth support.
   * Using 'same-origin' ensures the browser sends stored Basic Auth credentials
   * without embedding them in the URL (which would cause fetch to fail).
   */
  async _fetch(r, n) {
    return fetch(r, {
      ...n,
      credentials: "same-origin"
    });
  }
  /**
   * Generic fetch method for API requests.
   * Automatically prepends the base URL and /api prefix.
   */
  async fetch(r, n) {
    const a = `${this.baseUrl}/api${r.startsWith("/") ? r : `/${r}`}`, o = await this._fetch(a, {
      ...n,
      headers: {
        "Content-Type": "application/json",
        ...n == null ? void 0 : n.headers
      }
    });
    if (!o.ok) {
      const s = await o.json().catch(() => ({}));
      throw new Error(s.error || s.message || `Request failed: ${o.statusText}`);
    }
    return o.json();
  }
  // ==================
  // Plugin Feature Detection
  // ==================
  /**
   * Detect which user management plugins are available by probing their endpoints
   */
  async detectFeatures() {
    const [r, n, a] = await Promise.all([
      this.checkEndpoint("/api/users"),
      this.checkEndpoint("/api/bans"),
      this.checkEndpoint("/api/entitlements/available")
    ]);
    let o = !0;
    if (a)
      try {
        o = (await this.getEntitlementsStatus()).readonly;
      } catch {
      }
    return { users: r, bans: n, entitlements: a, entitlementsReadonly: o };
  }
  async checkEndpoint(r) {
    try {
      return (await this._fetch(`${this.baseUrl}${r}`, { method: "HEAD" })).status !== 404;
    } catch {
      return !1;
    }
  }
  // ==================
  // Users API
  // ==================
  async getUsers(r = {}) {
    return (await this.ensureClient()).users.query(r);
  }
  async getUserById(r) {
    return (await this.ensureClient()).users.get(r);
  }
  async inviteUser(r) {
    return (await this.ensureClient()).users.invite(r);
  }
  async acceptInvitation(r) {
    const n = await this._fetch(`${this.baseUrl}/api/users/accept-invitation/${encodeURIComponent(r)}`);
    if (!n.ok) {
      const a = await n.json().catch(() => ({}));
      throw new Error(a.error || `Accept invitation failed: ${n.statusText}`);
    }
    return n.json();
  }
  async getInvitations() {
    const r = new URLSearchParams();
    r.set("status", "invited"), r.set("limit", "100");
    const n = await this._fetch(`${this.baseUrl}/api/users?${r}`);
    if (!n.ok)
      throw new Error(`Invitations request failed: ${n.statusText}`);
    return n.json();
  }
  // ==================
  // Bans API
  // ==================
  async getBans() {
    return (await this.ensureClient()).bans.query();
  }
  async banUser(r, n, a) {
    let o;
    if (a) {
      const l = new Date(a), c = /* @__PURE__ */ new Date();
      o = Math.max(0, Math.floor((l.getTime() - c.getTime()) / 1e3));
    }
    const s = await this._fetch(`${this.baseUrl}/api/bans/email/${encodeURIComponent(r)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: n, duration: o })
    });
    if (!s.ok) {
      const l = await s.json().catch(() => ({}));
      throw new Error(l.error || `Ban request failed: ${s.statusText}`);
    }
  }
  async unbanUser(r) {
    const n = await this._fetch(`${this.baseUrl}/api/bans/email/${encodeURIComponent(r)}`, {
      method: "DELETE"
    });
    if (!n.ok)
      throw new Error(`Unban request failed: ${n.statusText}`);
  }
  async checkBan(r) {
    const n = await this._fetch(`${this.baseUrl}/api/bans/email/${encodeURIComponent(r)}`);
    if (!n.ok)
      throw new Error(`Ban check failed: ${n.statusText}`);
    return { banned: (await n.json()).isBanned };
  }
  // ==================
  // Entitlements API
  // ==================
  async getEntitlements(r) {
    const n = await this._fetch(`${this.baseUrl}/api/entitlements/${encodeURIComponent(r)}`);
    if (!n.ok)
      throw new Error(`Entitlements request failed: ${n.statusText}`);
    return n.json();
  }
  async refreshEntitlements(r) {
    const n = await this._fetch(`${this.baseUrl}/api/entitlements/${encodeURIComponent(r)}/refresh`, {
      method: "POST"
    });
    if (!n.ok)
      throw new Error(`Entitlements refresh failed: ${n.statusText}`);
    return n.json();
  }
  async checkEntitlement(r, n) {
    const a = await this._fetch(
      `${this.baseUrl}/api/entitlements/${encodeURIComponent(r)}/check/${encodeURIComponent(n)}`
    );
    if (!a.ok)
      throw new Error(`Entitlement check failed: ${a.statusText}`);
    return a.json();
  }
  async getAvailableEntitlements() {
    const r = await this._fetch(`${this.baseUrl}/api/entitlements/available`);
    if (!r.ok)
      throw new Error(`Available entitlements request failed: ${r.statusText}`);
    return (await r.json()).entitlements;
  }
  async grantEntitlement(r, n) {
    const a = await this._fetch(`${this.baseUrl}/api/entitlements/${encodeURIComponent(r)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entitlement: n })
    });
    if (!a.ok) {
      const o = await a.json().catch(() => ({}));
      throw new Error(o.error || `Grant entitlement failed: ${a.statusText}`);
    }
  }
  async revokeEntitlement(r, n) {
    const a = await this._fetch(
      `${this.baseUrl}/api/entitlements/${encodeURIComponent(r)}/${encodeURIComponent(n)}`,
      { method: "DELETE" }
    );
    if (!a.ok)
      throw new Error(`Revoke entitlement failed: ${a.statusText}`);
  }
  async invalidateEntitlementCache(r) {
    const n = await this._fetch(`${this.baseUrl}/api/entitlements/cache/${encodeURIComponent(r)}`, {
      method: "DELETE"
    });
    if (!n.ok)
      throw new Error(`Cache invalidation failed: ${n.statusText}`);
  }
  async getEntitlementsStatus() {
    return (await this.ensureClient()).entitlements.query();
  }
  // ==================
  // Health API
  // ==================
  async getHealth() {
    return (await this.ensureClient()).core.health();
  }
  async getInfo() {
    return (await this.ensureClient()).core.info();
  }
  async getDiagnostics() {
    return (await this.ensureClient()).core.diagnostics();
  }
  async getConfig() {
    return (await this.ensureClient()).config.query();
  }
  async getLogs(r = {}) {
    return (await this.ensureClient()).logs.query(r);
  }
  async getLogSources() {
    return (await this.ensureClient()).logs.sources();
  }
  // ==================
  // Plugins API
  // ==================
  async getPlugins() {
    return (await this.ensureClient()).core.plugins();
  }
  async getPluginDetail(r) {
    const n = await this._fetch(`${this.baseUrl}/api/plugins/${encodeURIComponent(r)}`);
    if (!n.ok)
      throw n.status === 404 ? new Error(`Plugin not found: ${r}`) : new Error(`Plugin detail request failed: ${n.statusText}`);
    return n.json();
  }
  // ==================
  // UI Contributions API
  // ==================
  async getUiContributions() {
    return (await this.ensureClient()).core.uiContributions();
  }
  // ==================
  // Auth Config API
  // ==================
  async getAuthConfigStatus() {
    try {
      return await (await this.ensureClient()).auth.status();
    } catch (r) {
      if (r instanceof Error && r.message.includes("404"))
        return { state: "disabled", adapter: null };
      throw r;
    }
  }
  async getAuthConfig() {
    try {
      return await (await this.ensureClient()).auth.config();
    } catch (r) {
      if (r instanceof Error && r.message.includes("404"))
        return { state: "disabled", adapter: null };
      throw r;
    }
  }
  /**
   * Update auth configuration (save to database for hot-reload)
   */
  async updateAuthConfig(r) {
    return (await this.ensureClient()).auth.update(r);
  }
  /**
   * Delete auth configuration (revert to environment variables)
   */
  async deleteAuthConfig() {
    const r = await this._fetch(`${this.baseUrl}/api/auth/config`, {
      method: "DELETE"
    });
    if (!r.ok) {
      const n = await r.json().catch(() => ({}));
      throw new Error(n.error || `Auth config delete failed: ${r.statusText}`);
    }
    return r.json();
  }
  /**
   * Test auth provider connection without saving
   */
  async testAuthProvider(r) {
    return (await this.ensureClient()).auth.test(r);
  }
  /**
   * Test current auth provider connection (uses existing env/runtime config)
   */
  async testCurrentAuthProvider() {
    const r = await this._fetch(`${this.baseUrl}/api/auth/test-current`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    if (!r.ok) {
      const n = await r.json().catch(() => ({}));
      throw new Error(n.error || `Provider test failed: ${r.statusText}`);
    }
    return r.json();
  }
  // ==================
  // Rate Limit Config API
  // ==================
  async getRateLimitConfig() {
    return (await this.ensureClient()).rateLimit.config();
  }
  async updateRateLimitConfig(r) {
    return (await this.ensureClient()).rateLimit.update(r);
  }
  // ==================
  // Notifications API
  // ==================
  async getNotificationsStats() {
    return (await this.ensureClient()).notifications.stats();
  }
  async getNotificationsClients() {
    return (await this.ensureClient()).notifications.clients();
  }
  async disconnectNotificationsClient(r) {
    const n = await this._fetch(`${this.baseUrl}/api/notifications/clients/${encodeURIComponent(r)}`, {
      method: "DELETE"
    });
    if (!n.ok) {
      const a = await n.json().catch(() => ({}));
      throw new Error(a.error || `Disconnect client failed: ${n.statusText}`);
    }
    return n.json();
  }
  async forceNotificationsReconnect() {
    const r = await this._fetch(`${this.baseUrl}/api/notifications/reconnect`, {
      method: "POST"
    });
    if (!r.ok) {
      const n = await r.json().catch(() => ({}));
      throw new Error(n.error || `Force reconnect failed: ${r.statusText}`);
    }
    return r.json();
  }
  // ==================
  // API Keys API
  // ==================
  async getApiKeys() {
    return (await this.ensureClient()).apiKeys.query();
  }
  async createApiKey(r) {
    return (await this.ensureClient()).apiKeys.create(r);
  }
  async getApiKey(r) {
    return (await this.ensureClient()).apiKeys.get(r);
  }
  async updateApiKey(r, n) {
    return (await this.ensureClient()).apiKeys.update(r, n);
  }
  async deleteApiKey(r) {
    return (await this.ensureClient()).apiKeys.delete(r);
  }
  // Phase 2: Scope Management
  async getAvailableScopes() {
    return (await this.ensureClient()).apiKeys.scopes();
  }
  // Phase 2: Usage Tracking
  async getKeyUsage(r, n) {
    return (await this.ensureClient()).apiKeys.usage(r);
  }
  // ============================================================================
  // Preferences API
  // ============================================================================
  async getPreferences() {
    return (await this.ensureClient()).preferences.query();
  }
  async updatePreferences(r) {
    const n = `${this.baseUrl}/api/preferences`, a = await this._fetch(n, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(r)
    });
    if (!a.ok) {
      const o = await a.json().catch(() => ({ error: a.statusText }));
      throw new Error(o.error || `Failed to update preferences: ${a.statusText}`);
    }
    return a.json();
  }
  async deletePreferences() {
    const r = `${this.baseUrl}/api/preferences`, n = await this._fetch(r, {
      method: "DELETE"
    });
    if (!n.ok)
      throw new Error(`Failed to delete preferences: ${n.statusText}`);
  }
}
const Q = new vi(), oa = Pn(null);
function xi({ initialWidgets: e = [], children: r }) {
  const [n, a] = f(
    e.map((h) => ({ ...h, visible: h.visible !== !1, priority: h.priority ?? 100 }))
  ), o = Se((h) => {
    a((u) => u.some((g) => g.id === h.id) ? u.map((g) => g.id === h.id ? { ...h, visible: h.visible !== !1, priority: h.priority ?? 100 } : g) : [...u, { ...h, visible: h.visible !== !1, priority: h.priority ?? 100 }]);
  }, []), s = Se((h) => {
    a((u) => u.filter((p) => p.id !== h));
  }, []), l = Se((h, u) => {
    a((p) => p.map((g) => g.id === h ? { ...g, visible: u ?? !g.visible } : g));
  }, []), c = Se(() => n.filter((h) => h.visible !== !1).sort((h, u) => (h.priority ?? 100) - (u.priority ?? 100)), [n]);
  return /* @__PURE__ */ t(oa.Provider, { value: { widgets: n, registerWidget: o, unregisterWidget: s, toggleWidget: l, getVisibleWidgets: c }, children: r });
}
function sa() {
  const e = Dn(oa);
  if (!e)
    throw new Error("useDashboardWidgets must be used within a DashboardWidgetProvider");
  return e;
}
function Ol(e) {
  const { registerWidget: r, unregisterWidget: n } = sa();
  return f(() => (r(e), null)), () => n(e.id);
}
function Ci() {
  const { getVisibleWidgets: e } = sa(), r = e();
  return r.length === 0 ? null : /* @__PURE__ */ t(je, { children: r.map((n) => /* @__PURE__ */ i(m, { sx: { mt: 4 }, children: [
    n.title && /* @__PURE__ */ t(x, { variant: "h6", sx: { mb: 2, color: "var(--theme-text-primary)" }, children: n.title }),
    n.component
  ] }, n.id)) });
}
const ia = Pn(null);
function wi({
  initialComponents: e = [],
  children: r
}) {
  const [n, a] = f(() => {
    const p = /* @__PURE__ */ new Map();
    for (const g of e)
      p.set(g.name, g.component);
    return p;
  }), o = Se((p, g) => {
    a((v) => {
      const w = new Map(v);
      return w.set(p, g), w;
    });
  }, []), s = Se((p) => {
    a((g) => {
      const v = new Map(g);
      for (const w of p)
        v.set(w.name, w.component);
      return v;
    });
  }, []), l = Se((p) => n.get(p) ?? null, [n]), c = Se((p) => n.has(p), [n]), h = Se(() => Array.from(n.keys()), [n]), u = wa(
    () => ({
      registerComponent: o,
      registerComponents: s,
      getComponent: l,
      hasComponent: c,
      getRegisteredNames: h
    }),
    [o, s, l, c, h]
  );
  return /* @__PURE__ */ t(ia.Provider, { value: u, children: r });
}
function Si() {
  const e = Dn(ia);
  if (!e)
    throw new Error("useWidgetComponentRegistry must be used within a WidgetComponentRegistryProvider");
  return e;
}
function ki({
  widgetType: e,
  defaultOnly: r = !0,
  additionalWidgetIds: n = []
}) {
  const [a, o] = f([]), [s, l] = f(!0), [c, h] = f(null), { getComponent: u, hasComponent: p } = Si();
  if (oe(() => {
    (async () => {
      try {
        const w = await Q.getUiContributions();
        o(w.widgets || []), h(null);
      } catch (w) {
        h(w instanceof Error ? w.message : "Failed to fetch widgets");
      } finally {
        l(!1);
      }
    })();
  }, []), s)
    return /* @__PURE__ */ t(m, { sx: { display: "flex", justifyContent: "center", py: 4 }, children: /* @__PURE__ */ t(le, { size: 24 }) });
  if (c)
    return /* @__PURE__ */ t(Y, { severity: "error", sx: { mt: 2 }, children: c });
  const g = a.filter((v) => e && v.type !== e ? !1 : r ? v.showByDefault || n.includes(v.id) : !0).filter((v) => p(v.component) ? !0 : (console.warn(`Widget "${v.id}" references unregistered component "${v.component}"`), !1)).sort((v, w) => (v.priority ?? 100) - (w.priority ?? 100));
  return g.length === 0 ? null : /* @__PURE__ */ t(je, { children: g.map((v) => {
    const w = u(v.component);
    return /* @__PURE__ */ i(m, { sx: { mt: 4 }, children: [
      v.title && /* @__PURE__ */ t(x, { variant: "h6", sx: { mb: 2, color: "var(--theme-text-primary)" }, children: v.title }),
      w && /* @__PURE__ */ t(w, {})
    ] }, v.id);
  }) });
}
function Ei(e) {
  switch (e) {
    case "healthy":
      return /* @__PURE__ */ t(Me, { sx: { fontSize: 24, color: "var(--theme-success)" } });
    case "degraded":
      return /* @__PURE__ */ t(Kt, { sx: { fontSize: 24, color: "var(--theme-warning)" } });
    case "unhealthy":
      return /* @__PURE__ */ t(Ne, { sx: { fontSize: 24, color: "var(--theme-error)" } });
    default:
      return /* @__PURE__ */ t(Kt, { sx: { fontSize: 24, color: "var(--theme-text-secondary)" } });
  }
}
function Cn(e) {
  switch (e) {
    case "healthy":
      return "var(--theme-success)";
    case "degraded":
      return "var(--theme-warning)";
    case "unhealthy":
      return "var(--theme-error)";
    default:
      return "var(--theme-text-secondary)";
  }
}
function Ii(e) {
  return e <= 1 ? 1 : e === 2 ? 2 : e === 3 ? 3 : 4;
}
function $i() {
  const [e, r] = f(null), [n, a] = f(null);
  if (oe(() => {
    const l = async () => {
      try {
        const h = await Q.getHealth();
        r(h), a(null);
      } catch (h) {
        a(h instanceof Error ? h.message : "Failed to fetch health");
      }
    };
    l();
    const c = setInterval(l, 1e4);
    return () => clearInterval(c);
  }, []), n)
    return /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", border: "1px solid var(--theme-error)" }, children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ t(H, { variant: "body2", customColor: "var(--theme-error)", content: n }) }) });
  const o = e ? Object.entries(e.checks) : [];
  if (o.length === 0)
    return /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ t(H, { variant: "body2", customColor: "var(--theme-text-secondary)", content: "No health checks configured" }) }) });
  const s = Ii(o.length);
  return /* @__PURE__ */ t(ir, { columns: s, spacing: "medium", equalHeight: !0, children: o.map(([l, c]) => /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
    Ei(c.status),
    /* @__PURE__ */ i(m, { sx: { flex: 1, minWidth: 0 }, children: [
      /* @__PURE__ */ t(
        H,
        {
          variant: "body1",
          fontWeight: "500",
          content: l.charAt(0).toUpperCase() + l.slice(1),
          customColor: "var(--theme-text-primary)"
        }
      ),
      /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", gap: 1, mt: 0.5 }, children: [
        /* @__PURE__ */ t(
          de,
          {
            label: c.status,
            size: "small",
            sx: {
              bgcolor: Cn(c.status) + "20",
              color: Cn(c.status),
              fontSize: "0.75rem",
              height: 20
            }
          }
        ),
        c.latency !== void 0 && /* @__PURE__ */ t(
          H,
          {
            variant: "caption",
            content: `${c.latency}ms`,
            customColor: "var(--theme-text-secondary)"
          }
        )
      ] })
    ] })
  ] }) }) }, l)) });
}
function Ai() {
  const [e, r] = f(null), [n, a] = f(!0), [o, s] = f(null);
  if (oe(() => {
    (async () => {
      try {
        const u = await Q.fetch("/ai-proxy/config");
        r(u);
      } catch (u) {
        s(u instanceof Error ? u.message : "Failed to fetch integrations");
      } finally {
        a(!1);
      }
    })();
  }, []), n)
    return /* @__PURE__ */ t(m, { sx: { display: "flex", justifyContent: "center", py: 2 }, children: /* @__PURE__ */ t(le, { size: 20 }) });
  if (o)
    return /* @__PURE__ */ t(Y, { severity: "warning", sx: { py: 0.5, fontSize: 13 }, children: "Unable to load integrations" });
  if (!e) return null;
  const l = e.integrations.filter((h) => h.configured).length, c = e.integrations.length;
  return /* @__PURE__ */ i(
    m,
    {
      sx: {
        bgcolor: "var(--theme-surface)",
        borderRadius: 2,
        p: 2,
        border: "1px solid var(--theme-border)"
      },
      children: [
        /* @__PURE__ */ i(m, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }, children: [
          /* @__PURE__ */ i(x, { variant: "subtitle2", sx: { color: "var(--theme-text-secondary)" }, children: [
            l,
            " of ",
            c,
            " configured"
          ] }),
          /* @__PURE__ */ i(x, { variant: "subtitle2", sx: { color: "var(--theme-text-secondary)" }, children: [
            e.stats.totalRequests,
            " requests"
          ] })
        ] }),
        /* @__PURE__ */ t(m, { sx: { display: "flex", flexDirection: "column", gap: 1.5 }, children: e.integrations.map((h) => /* @__PURE__ */ i(
          m,
          {
            sx: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 1.5,
              bgcolor: "var(--theme-background)",
              borderRadius: 1
            },
            children: [
              /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                h.configured ? /* @__PURE__ */ t(Me, { sx: { color: "var(--theme-success)", fontSize: 18 } }) : /* @__PURE__ */ t(Ne, { sx: { color: "var(--theme-text-secondary)", fontSize: 18 } }),
                /* @__PURE__ */ i(m, { children: [
                  /* @__PURE__ */ t(x, { variant: "body2", sx: { color: "var(--theme-text-primary)", fontWeight: 500 }, children: h.name }),
                  /* @__PURE__ */ t(x, { variant: "caption", sx: { color: "var(--theme-text-secondary)" }, children: h.description })
                ] })
              ] }),
              /* @__PURE__ */ t(
                de,
                {
                  label: h.configured ? "Connected" : "Not Configured",
                  size: "small",
                  sx: {
                    bgcolor: h.configured ? "var(--theme-success)20" : "transparent",
                    color: h.configured ? "var(--theme-success)" : "var(--theme-text-secondary)",
                    border: h.configured ? "none" : "1px solid var(--theme-border)",
                    fontWeight: 500,
                    fontSize: 11
                  }
                }
              )
            ]
          },
          h.id
        )) })
      ]
    }
  );
}
const Ur = te(/* @__PURE__ */ t("path", {
  d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2M4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12m8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8"
}), "Block"), Ti = {
  supertokens: "SuperTokens",
  auth0: "Auth0",
  supabase: "Supabase",
  basic: "Basic Auth"
};
function Pi() {
  const [e, r] = f(null), [n, a] = f(!0), [o, s] = f(null);
  if (oe(() => {
    (async () => {
      try {
        const u = await Q.fetch("/auth/config/status");
        r(u);
      } catch (u) {
        s(u instanceof Error ? u.message : "Failed to fetch auth status");
      } finally {
        a(!1);
      }
    })();
  }, []), n)
    return /* @__PURE__ */ t(m, { sx: { display: "flex", justifyContent: "center", py: 2 }, children: /* @__PURE__ */ t(le, { size: 20 }) });
  if (o)
    return /* @__PURE__ */ t(Y, { severity: "warning", sx: { py: 0.5, fontSize: 13 }, children: "Unable to load auth status" });
  if (!e) return null;
  const l = () => {
    switch (e.state) {
      case "enabled":
        return /* @__PURE__ */ t(Me, { sx: { color: "var(--theme-success)", fontSize: 32 } });
      case "error":
        return /* @__PURE__ */ t(Ne, { sx: { color: "var(--theme-error)", fontSize: 32 } });
      case "disabled":
      default:
        return /* @__PURE__ */ t(Ur, { sx: { color: "var(--theme-text-secondary)", fontSize: 32 } });
    }
  }, c = () => {
    switch (e.state) {
      case "enabled":
        return "var(--theme-success)";
      case "error":
        return "var(--theme-error)";
      case "disabled":
      default:
        return "var(--theme-text-secondary)";
    }
  };
  return /* @__PURE__ */ i(
    m,
    {
      sx: {
        bgcolor: "var(--theme-surface)",
        borderRadius: 2,
        p: 2,
        border: "1px solid var(--theme-border)"
      },
      children: [
        /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
          l(),
          /* @__PURE__ */ i(m, { sx: { flex: 1 }, children: [
            /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 0.5 }, children: [
              /* @__PURE__ */ t(x, { variant: "subtitle1", sx: { color: "var(--theme-text-primary)", fontWeight: 600 }, children: e.state === "enabled" && e.adapter ? Ti[e.adapter] || e.adapter : e.state === "disabled" ? "Not Configured" : "Configuration Error" }),
              /* @__PURE__ */ t(
                de,
                {
                  label: e.state.toUpperCase(),
                  size: "small",
                  sx: {
                    bgcolor: `${c()}20`,
                    color: c(),
                    fontWeight: 600,
                    fontSize: 10,
                    height: 20
                  }
                }
              )
            ] }),
            /* @__PURE__ */ t(x, { variant: "body2", sx: { color: "var(--theme-text-secondary)" }, children: e.state === "enabled" ? "Authentication is active" : e.state === "disabled" ? "Set AUTH_ADAPTER environment variable" : e.error || "Check configuration" })
          ] })
        ] }),
        e.missingVars && e.missingVars.length > 0 && /* @__PURE__ */ i(Y, { severity: "warning", sx: { mt: 2, py: 0.5, "& .MuiAlert-message": { fontSize: 12 } }, children: [
          "Missing: ",
          e.missingVars.join(", ")
        ] })
      ]
    }
  );
}
const Di = te(/* @__PURE__ */ t("path", {
  d: "m1 9 2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9m8 8 3 3 3-3c-1.65-1.66-4.34-1.66-6 0m-4-4 2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13"
}), "Wifi"), wn = te(/* @__PURE__ */ t("path", {
  d: "M22.99 9C19.15 5.16 13.8 3.76 8.84 4.78l2.52 2.52c3.47-.17 6.99 1.05 9.63 3.7zm-4 4c-1.29-1.29-2.84-2.13-4.49-2.56l3.53 3.53zM2 3.05 5.07 6.1C3.6 6.82 2.22 7.78 1 9l1.99 2c1.24-1.24 2.67-2.16 4.2-2.77l2.24 2.24C7.81 10.89 6.27 11.73 5 13v.01L6.99 15c1.36-1.36 3.14-2.04 4.92-2.06L18.98 20l1.27-1.26L3.29 1.79zM9 17l3 3 3-3c-1.65-1.66-4.34-1.66-6 0"
}), "WifiOff"), Ni = te(/* @__PURE__ */ t("path", {
  d: "M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1m-1 9h-4v-7h4z"
}), "Devices"), la = te(/* @__PURE__ */ t("path", {
  d: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4"
}), "Person"), zi = te(/* @__PURE__ */ t("path", {
  d: "M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"
}), "Send");
function Ir(e) {
  return e >= 1e6 ? `${(e / 1e6).toFixed(1)}M` : e >= 1e3 ? `${(e / 1e3).toFixed(1)}K` : e.toString();
}
function Oi(e) {
  return e < 1e3 ? `${e}ms` : e < 6e4 ? `${(e / 1e3).toFixed(0)}s` : e < 36e5 ? `${(e / 6e4).toFixed(0)}m` : `${(e / 36e5).toFixed(1)}h`;
}
function Bi() {
  const [e, r] = f(null), [n, a] = f(null), [o, s] = f(!0);
  if (oe(() => {
    const h = async () => {
      try {
        const p = await Q.getNotificationsStats();
        r(p), a(null);
      } catch (p) {
        p instanceof Error && p.message.includes("404") ? a("Notifications plugin not enabled") : a(p instanceof Error ? p.message : "Failed to fetch stats");
      } finally {
        s(!1);
      }
    };
    h();
    const u = setInterval(h, 5e3);
    return () => clearInterval(u);
  }, []), o)
    return /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ t(Gt, {}) }) });
  if (n)
    return /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", border: "1px solid var(--theme-border)" }, children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
      /* @__PURE__ */ t(wn, { sx: { color: "var(--theme-text-secondary)" } }),
      /* @__PURE__ */ t(H, { variant: "body2", customColor: "var(--theme-text-secondary)", content: n })
    ] }) }) });
  if (!e)
    return null;
  const l = e.connectionHealth.isHealthy, c = l ? "var(--theme-success)" : "var(--theme-warning)";
  return /* @__PURE__ */ i(m, { children: [
    /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", mb: 2 }, children: /* @__PURE__ */ t(W, { sx: { py: 1, "&:last-child": { pb: 1 } }, children: /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
      /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
        l ? /* @__PURE__ */ t(Di, { sx: { color: c, fontSize: 20 } }) : /* @__PURE__ */ t(wn, { sx: { color: c, fontSize: 20 } }),
        /* @__PURE__ */ t(
          H,
          {
            variant: "body2",
            content: l ? "Connected" : "Reconnecting...",
            customColor: c,
            fontWeight: "500"
          }
        ),
        e.connectionHealth.isReconnecting && /* @__PURE__ */ t(
          de,
          {
            label: `Attempt ${e.connectionHealth.reconnectAttempts}`,
            size: "small",
            sx: {
              bgcolor: "var(--theme-warning)20",
              color: "var(--theme-warning)",
              fontSize: "0.7rem",
              height: 18
            }
          }
        )
      ] }),
      /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        /* @__PURE__ */ t(
          H,
          {
            variant: "caption",
            content: `${e.channels.length} channel${e.channels.length !== 1 ? "s" : ""}`,
            customColor: "var(--theme-text-secondary)"
          }
        ),
        e.lastEventAt && /* @__PURE__ */ t(
          H,
          {
            variant: "caption",
            content: `Last event: ${Oi(e.connectionHealth.timeSinceLastEvent)} ago`,
            customColor: "var(--theme-text-secondary)"
          }
        )
      ] })
    ] }) }) }),
    /* @__PURE__ */ i(ir, { columns: 4, spacing: "small", equalHeight: !0, children: [
      /* @__PURE__ */ t(
        Wt,
        {
          icon: /* @__PURE__ */ t(Ni, { sx: { fontSize: 28 } }),
          label: "Active Clients",
          value: e.currentConnections,
          subValue: `${e.totalConnections} total`,
          color: "var(--theme-primary)"
        }
      ),
      /* @__PURE__ */ t(
        Wt,
        {
          icon: /* @__PURE__ */ t(la, { sx: { fontSize: 28 } }),
          label: "By Device",
          value: e.clientsByType.device,
          subValue: `${e.clientsByType.user} by user`,
          color: "var(--theme-info)"
        }
      ),
      /* @__PURE__ */ t(
        Wt,
        {
          icon: /* @__PURE__ */ t(zi, { sx: { fontSize: 28 } }),
          label: "Events Routed",
          value: Ir(e.eventsRouted),
          subValue: `${Ir(e.eventsProcessed)} processed`,
          color: "var(--theme-success)"
        }
      ),
      /* @__PURE__ */ t(
        Wt,
        {
          icon: /* @__PURE__ */ t(Ne, { sx: { fontSize: 28 } }),
          label: "Dropped",
          value: Ir(e.eventsDroppedNoClients),
          subValue: `${e.eventsParseFailed} parse errors`,
          color: e.eventsDroppedNoClients > 0 ? "var(--theme-warning)" : "var(--theme-text-secondary)"
        }
      )
    ] })
  ] });
}
const _i = te(/* @__PURE__ */ t("path", {
  d: "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1M8 13h8v-2H8zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5"
}), "Link");
function Mi() {
  const [e, r] = f(null), [n, a] = f(!0), [o, s] = f(null), l = async () => {
    try {
      const p = window.__APP_BASE_PATH__ || "", g = await fetch(`${p}/api/cms/status`);
      if (!g.ok)
        throw new Error(`HTTP ${g.status}: ${g.statusText}`);
      const v = await g.json();
      r(v), s(null);
    } catch (p) {
      s(p instanceof Error ? p.message : "Failed to fetch CMS status");
    } finally {
      a(!1);
    }
  };
  if (oe(() => {
    l();
    const p = setInterval(l, 3e4);
    return () => clearInterval(p);
  }, []), n)
    return /* @__PURE__ */ t(F, { children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ t(m, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100px", children: /* @__PURE__ */ t(le, { size: 24 }) }) }) });
  if (o || !e)
    return /* @__PURE__ */ t(F, { children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ t(Y, { severity: "error", children: o || "Failed to load CMS status" }) }) });
  const c = e.status === "running", h = c ? "success" : e.status === "unhealthy" ? "warning" : "error", u = c ? Me : Ne;
  return /* @__PURE__ */ t(F, { children: /* @__PURE__ */ i(W, { children: [
    /* @__PURE__ */ i(m, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, children: [
      /* @__PURE__ */ t(x, { variant: "h6", children: "Payload CMS" }),
      /* @__PURE__ */ t(
        de,
        {
          label: e.status.toUpperCase(),
          color: h,
          size: "small",
          icon: /* @__PURE__ */ t(u, {})
        }
      )
    ] }),
    /* @__PURE__ */ i(m, { display: "flex", flexDirection: "column", gap: 1, children: [
      /* @__PURE__ */ i(m, { display: "flex", alignItems: "center", gap: 1, children: [
        /* @__PURE__ */ t(_i, { fontSize: "small", color: "action" }),
        /* @__PURE__ */ t(x, { variant: "body2", color: "text.secondary", children: e.url })
      ] }),
      e.error && /* @__PURE__ */ t(Y, { severity: "error", sx: { mt: 1 }, children: e.error }),
      /* @__PURE__ */ i(x, { variant: "caption", color: "text.secondary", sx: { mt: 1 }, children: [
        "Last checked: ",
        new Date(e.timestamp).toLocaleTimeString()
      ] })
    ] })
  ] }) });
}
const mt = te(/* @__PURE__ */ t("path", {
  d: "M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z"
}), "Refresh"), At = te(/* @__PURE__ */ t("path", {
  d: "M8 5v14l11-7z"
}), "PlayArrow");
function Ri() {
  const [e, r] = f(null), [n, a] = f([]), [o, s] = f(!0), [l, c] = f(null), [h, u] = f(null), [p, g] = f(null), v = async () => {
    try {
      const E = window.__APP_BASE_PATH__ || "", y = await fetch(`${E}/api/cms/status`);
      if (!y.ok)
        throw new Error(`HTTP ${y.status}: ${y.statusText}`);
      const P = await y.json();
      r(P);
    } catch (E) {
      console.error("Failed to fetch CMS status:", E);
    }
  }, w = async () => {
    try {
      const E = window.__APP_BASE_PATH__ || "", y = await fetch(`${E}/api/cms/seeds`);
      if (!y.ok)
        throw new Error(`HTTP ${y.status}: ${y.statusText}`);
      const P = await y.json();
      a(P.seeds || []);
    } catch (E) {
      console.error("Failed to fetch seeds:", E);
    } finally {
      s(!1);
    }
  };
  oe(() => {
    v(), w();
    const E = setInterval(v, 3e4);
    return () => clearInterval(E);
  }, []);
  const b = async () => {
    u(null), g(null);
    try {
      const E = window.__APP_BASE_PATH__ || "", y = await fetch(`${E}/api/cms/restart`, { method: "POST" }), P = await y.json();
      y.ok ? (g("CMS service restarted successfully"), setTimeout(() => v(), 2e3)) : u(P.message || "Restart not implemented");
    } catch (E) {
      u(E instanceof Error ? E.message : "Failed to restart CMS");
    }
  }, A = async (E) => {
    c(E), u(null), g(null);
    try {
      const y = window.__APP_BASE_PATH__ || "", P = await fetch(`${y}/api/cms/seeds/${E}/execute`, {
        method: "POST"
      });
      if (!P.ok)
        throw new Error(`HTTP ${P.status}: ${P.statusText}`);
      const D = await P.json();
      D.success ? g(`Seed "${E}" executed successfully`) : u(D.error || "Seed execution failed");
    } catch (y) {
      u(y instanceof Error ? y.message : "Failed to execute seed");
    } finally {
      c(null);
    }
  };
  if (o)
    return /* @__PURE__ */ t(F, { children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ t(m, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px", children: /* @__PURE__ */ t(le, {}) }) }) });
  const $ = (e == null ? void 0 : e.status) === "running", N = $ ? "success" : (e == null ? void 0 : e.status) === "unhealthy" ? "warning" : "error", O = $ ? Me : Ne;
  return /* @__PURE__ */ t(F, { children: /* @__PURE__ */ i(W, { children: [
    /* @__PURE__ */ i(m, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, children: [
      /* @__PURE__ */ t(x, { variant: "h6", children: "CMS Service Control" }),
      e && /* @__PURE__ */ t(
        de,
        {
          label: e.status.toUpperCase(),
          color: N,
          size: "small",
          icon: /* @__PURE__ */ t(O, {})
        }
      )
    ] }),
    h && /* @__PURE__ */ t(Y, { severity: "error", sx: { mb: 2 }, onClose: () => u(null), children: h }),
    p && /* @__PURE__ */ t(Y, { severity: "success", sx: { mb: 2 }, onClose: () => g(null), children: p }),
    /* @__PURE__ */ i(m, { mb: 3, children: [
      /* @__PURE__ */ t(x, { variant: "subtitle2", gutterBottom: !0, children: "Service Control" }),
      /* @__PURE__ */ t(x, { variant: "body2", color: "text.secondary", mb: 2, children: "Manage the Payload CMS service" }),
      /* @__PURE__ */ t(
        ae,
        {
          variant: "outlined",
          startIcon: /* @__PURE__ */ t(mt, {}),
          onClick: b,
          disabled: !e,
          children: "Restart CMS Service"
        }
      )
    ] }),
    /* @__PURE__ */ t(zn, { sx: { my: 2 } }),
    /* @__PURE__ */ i(m, { children: [
      /* @__PURE__ */ i(m, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, children: [
        /* @__PURE__ */ t(x, { variant: "subtitle2", children: "Seed Scripts" }),
        /* @__PURE__ */ t(Be, { size: "small", onClick: w, children: /* @__PURE__ */ t(mt, { fontSize: "small" }) })
      ] }),
      /* @__PURE__ */ t(x, { variant: "body2", color: "text.secondary", mb: 2, children: "Execute database seed scripts for initial data setup" }),
      n.length > 0 ? /* @__PURE__ */ t(On, { dense: !0, children: n.map((E) => /* @__PURE__ */ t(
        Bn,
        {
          secondaryAction: /* @__PURE__ */ t(
            ae,
            {
              variant: "outlined",
              size: "small",
              startIcon: l === E.name ? /* @__PURE__ */ t(le, { size: 16 }) : /* @__PURE__ */ t(At, {}),
              onClick: () => A(E.name),
              disabled: l !== null,
              children: l === E.name ? "Running..." : "Run"
            }
          ),
          children: /* @__PURE__ */ t(
            _n,
            {
              primary: E.name,
              secondary: E.file
            }
          )
        },
        E.name
      )) }) : /* @__PURE__ */ t(Y, { severity: "info", children: "No seed scripts found. Place seed scripts in the configured seeds directory." })
    ] })
  ] }) });
}
const ca = te(/* @__PURE__ */ t("path", {
  d: "M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z"
}), "ExpandMore"), Li = te(/* @__PURE__ */ t("path", {
  d: "M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8z"
}), "Folder"), Wi = te(/* @__PURE__ */ t("path", {
  d: "M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
}), "Close");
function ji() {
  const [e, r] = f([]), [n, a] = f(!0), [o, s] = f(null), [l, c] = f(!1), [h, u] = f(/* @__PURE__ */ new Set()), [p, g] = f(!1), [v, w] = f([]), [b, A] = f(null), [$, N] = f(!1), [O, E] = f(""), [y, P] = f("success"), [D, V] = f(!1), [j, B] = f(!1);
  oe(() => {
    ce();
  }, []);
  const ce = async () => {
    try {
      const L = window.__APP_BASE_PATH__ || "", q = await fetch(`${L}/api/maintenance/seeds/discover`);
      if (!q.ok) throw new Error("Failed to fetch seeds");
      const J = await q.json();
      r(J.seeds || []), s(null);
    } catch (L) {
      s(L instanceof Error ? L.message : "Failed to fetch seeds");
    } finally {
      a(!1);
    }
  }, R = (L) => L.type === "file" ? L.path : L.id, d = (L) => L.type === "task" ? L.name : L.name.replace(".mjs", "").replace(/^\d+\./, "").split(/[-_]/).map((Z) => Z.charAt(0).toUpperCase() + Z.slice(1)).join(" "), z = () => {
    const L = /* @__PURE__ */ new Map();
    return e.forEach((q) => {
      let J = "Ungrouped";
      if (q.type === "file" && q.path) {
        const Z = q.path.split("/");
        Z.length > 1 && (J = Z[0]);
      }
      L.has(J) || L.set(J, []), L.get(J).push(q);
    }), Array.from(L.entries()).map(([q, J]) => ({ name: q, seeds: J })).sort((q, J) => q.name.localeCompare(J.name, void 0, { numeric: !0 }));
  }, C = (L) => {
    const q = new Set(h);
    q.has(L) ? q.delete(L) : q.add(L), u(q);
  }, M = (L) => {
    const q = L.seeds.map(R), J = q.every((T) => h.has(T)), Z = new Set(h);
    J ? q.forEach((T) => Z.delete(T)) : q.forEach((T) => Z.add(T)), u(Z);
  }, U = async (L, q, J) => {
    var Xe, ft;
    const Z = window.__APP_BASE_PATH__ || "", T = await fetch(`${Z}/api/maintenance/seeds/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: L, type: J })
    });
    if (!T.ok && !((Xe = T.headers.get("content-type")) != null && Xe.includes("text/event-stream"))) {
      const Fe = await T.json().catch(() => ({ error: "Failed to start execution" }));
      throw new Error(Fe.error || "Failed to start execution");
    }
    const ye = (ft = T.body) == null ? void 0 : ft.getReader(), Ce = new TextDecoder();
    let re = "", ve = "", ze = 1;
    if (ye)
      try {
        for (; ; ) {
          const { done: Fe, value: Ke } = await ye.read();
          if (Fe) break;
          const et = Ce.decode(Ke, { stream: !0 }).split(`
`);
          for (const Re of et)
            if (Re.startsWith("data: "))
              try {
                const Ee = JSON.parse(Re.slice(6));
                Ee.type === "stdout" ? re += Ee.data : Ee.type === "stderr" ? ve += Ee.data : Ee.type === "exit" && (ze = JSON.parse(Ee.data).exitCode);
              } catch {
              }
        }
      } finally {
        ye.releaseLock();
      }
    return {
      seedName: q,
      success: ze === 0,
      output: re || void 0,
      error: ve || (ze !== 0 ? "Execution failed" : void 0)
    };
  }, he = async () => {
    B(!0), V(!1);
    try {
      const L = window.__APP_BASE_PATH__ || "", q = await fetch(`${L}/api/maintenance/database/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      }), J = await q.json();
      if (!q.ok)
        throw new Error(J.error || "Failed to reset database");
      E("Database reset successfully. All tables and data have been deleted."), P("success"), N(!0), await ce();
    } catch (L) {
      E(L instanceof Error ? L.message : "Database reset failed"), P("error"), N(!0);
    } finally {
      B(!1);
    }
  }, G = async () => {
    if (h.size === 0) return;
    c(!0), g(!0), w([]);
    const L = e.filter((T) => h.has(R(T))), q = [];
    for (const T of L) {
      const ye = R(T), Ce = d(T);
      A(Ce);
      try {
        const re = await U(ye, Ce, T.type);
        q.push(re);
      } catch (re) {
        q.push({
          seedName: Ce,
          success: !1,
          error: re instanceof Error ? re.message : "Unknown error"
        });
      }
      w([...q]);
    }
    A(null), c(!1);
    const J = q.filter((T) => T.success).length, Z = q.length - J;
    Z === 0 ? (E(`Successfully executed ${J} seed${J > 1 ? "s" : ""}`), P("success"), u(/* @__PURE__ */ new Set()), await ce()) : (E(`Completed with ${Z} error${Z > 1 ? "s" : ""}`), P("error")), N(!0);
  };
  if (n)
    return /* @__PURE__ */ t(F, { children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ t(m, { sx: { display: "flex", justifyContent: "center", py: 2 }, children: /* @__PURE__ */ t(le, { size: 24 }) }) }) });
  const be = z();
  return /* @__PURE__ */ i(je, { children: [
    /* @__PURE__ */ t(F, { children: /* @__PURE__ */ i(W, { children: [
      /* @__PURE__ */ i(m, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }, children: [
        /* @__PURE__ */ i(m, { children: [
          /* @__PURE__ */ t(x, { variant: "h6", children: "Seed Management" }),
          /* @__PURE__ */ t(x, { variant: "body2", color: "text.secondary", children: "Manage and execute seed scripts" })
        ] }),
        /* @__PURE__ */ i(m, { sx: { display: "flex", gap: 1 }, children: [
          h.size > 0 && /* @__PURE__ */ i(
            ae,
            {
              variant: "contained",
              color: "primary",
              startIcon: l ? /* @__PURE__ */ t(le, { size: 16 }) : /* @__PURE__ */ t(At, {}),
              onClick: G,
              disabled: l || j,
              children: [
                "Run Selected (",
                h.size,
                ")"
              ]
            }
          ),
          /* @__PURE__ */ t(
            ae,
            {
              variant: "outlined",
              color: "error",
              onClick: () => V(!0),
              disabled: l || j,
              children: "Reset Database"
            }
          )
        ] })
      ] }),
      o && /* @__PURE__ */ t(Y, { severity: "error", sx: { mb: 2 }, children: o }),
      e.length === 0 ? /* @__PURE__ */ t(Y, { severity: "info", children: "No seed scripts found" }) : /* @__PURE__ */ t(m, { children: be.map((L) => {
        const q = L.seeds.map(R), J = q.every((T) => h.has(T)), Z = q.some((T) => h.has(T));
        return /* @__PURE__ */ i(Ea, { defaultExpanded: !0, children: [
          /* @__PURE__ */ t(Ia, { expandIcon: /* @__PURE__ */ t(ca, {}), children: /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", gap: 1, width: "100%" }, children: [
            /* @__PURE__ */ t(
              Xr,
              {
                checked: J,
                indeterminate: Z && !J,
                onClick: (T) => {
                  T.stopPropagation(), M(L);
                }
              }
            ),
            /* @__PURE__ */ t(Li, { color: "primary" }),
            /* @__PURE__ */ t(x, { variant: "subtitle1", sx: { flexGrow: 1 }, children: L.name }),
            /* @__PURE__ */ t(de, { label: `${L.seeds.length} seed${L.seeds.length > 1 ? "s" : ""}`, size: "small" })
          ] }) }),
          /* @__PURE__ */ t($a, { children: /* @__PURE__ */ t(On, { dense: !0, children: L.seeds.map((T) => {
            const ye = R(T), Ce = h.has(ye);
            return /* @__PURE__ */ t(
              Bn,
              {
                disablePadding: !0,
                secondaryAction: /* @__PURE__ */ t(
                  ae,
                  {
                    variant: "outlined",
                    size: "small",
                    startIcon: /* @__PURE__ */ t(At, {}),
                    onClick: async () => {
                      const re = d(T);
                      c(!0), g(!0), w([]), A(re);
                      try {
                        const ve = await U(ye, re, T.type);
                        w([ve]), ve.success ? (E(`${re} executed successfully`), P("success"), await ce()) : (E(`${re} execution failed`), P("error"));
                      } catch (ve) {
                        w([{
                          seedName: re,
                          success: !1,
                          error: ve instanceof Error ? ve.message : "Unknown error"
                        }]), E(`${re} execution failed`), P("error");
                      } finally {
                        A(null), c(!1), N(!0);
                      }
                    },
                    disabled: l,
                    children: "Run"
                  }
                ),
                children: /* @__PURE__ */ i(Aa, { onClick: () => C(ye), children: [
                  /* @__PURE__ */ t(Ta, { children: /* @__PURE__ */ t(
                    Xr,
                    {
                      edge: "start",
                      checked: Ce,
                      tabIndex: -1,
                      disableRipple: !0
                    }
                  ) }),
                  /* @__PURE__ */ t(
                    _n,
                    {
                      primary: d(T),
                      secondary: T.description || T.name
                    }
                  )
                ] })
              },
              ye
            );
          }) }) })
        ] }, L.name);
      }) })
    ] }) }),
    /* @__PURE__ */ i(
      lt,
      {
        open: p,
        onClose: () => !l && g(!1),
        maxWidth: "md",
        fullWidth: !0,
        children: [
          /* @__PURE__ */ i(ct, { children: [
            "Seed Execution",
            !l && /* @__PURE__ */ t(
              ae,
              {
                onClick: () => g(!1),
                sx: { position: "absolute", right: 8, top: 8 },
                size: "small",
                children: /* @__PURE__ */ t(Wi, {})
              }
            )
          ] }),
          /* @__PURE__ */ i(dt, { children: [
            l && b && /* @__PURE__ */ i(m, { sx: { mb: 2 }, children: [
              /* @__PURE__ */ i(x, { variant: "body2", color: "text.secondary", gutterBottom: !0, children: [
                "Currently executing: ",
                b
              ] }),
              /* @__PURE__ */ t(Gt, {})
            ] }),
            v.length > 0 && /* @__PURE__ */ t(m, { children: v.map((L, q) => /* @__PURE__ */ i(
              Pa,
              {
                sx: {
                  p: 2,
                  mb: 1,
                  backgroundColor: L.success ? "success.dark" : "error.dark",
                  color: "white"
                },
                children: [
                  /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 1 }, children: [
                    L.success ? /* @__PURE__ */ t(Me, { color: "inherit" }) : /* @__PURE__ */ t(Ne, { color: "inherit" }),
                    /* @__PURE__ */ t(x, { variant: "subtitle2", fontWeight: "bold", children: L.seedName })
                  ] }),
                  L.output && /* @__PURE__ */ t(x, { variant: "body2", sx: { whiteSpace: "pre-wrap", fontFamily: "monospace" }, children: L.output }),
                  L.error && /* @__PURE__ */ t(x, { variant: "body2", sx: { whiteSpace: "pre-wrap", fontFamily: "monospace" }, children: L.error })
                ]
              },
              q
            )) })
          ] }),
          /* @__PURE__ */ t(ht, { children: /* @__PURE__ */ t(ae, { onClick: () => g(!1), disabled: l, children: "Close" }) })
        ]
      }
    ),
    /* @__PURE__ */ i(
      lt,
      {
        open: D,
        onClose: () => !j && V(!1),
        maxWidth: "sm",
        fullWidth: !0,
        children: [
          /* @__PURE__ */ t(ct, { sx: { color: "error.main" }, children: "Reset Database?" }),
          /* @__PURE__ */ i(dt, { children: [
            /* @__PURE__ */ t(Y, { severity: "warning", sx: { mb: 2 }, children: "This action cannot be undone!" }),
            /* @__PURE__ */ t(x, { variant: "body1", gutterBottom: !0, children: "This will permanently delete:" }),
            /* @__PURE__ */ i(m, { component: "ul", sx: { pl: 2 }, children: [
              /* @__PURE__ */ t("li", { children: "All database tables" }),
              /* @__PURE__ */ t("li", { children: "All stored data" }),
              /* @__PURE__ */ t("li", { children: "All seed execution history" }),
              /* @__PURE__ */ t("li", { children: "All application content" })
            ] }),
            /* @__PURE__ */ t(x, { variant: "body2", color: "text.secondary", sx: { mt: 2 }, children: "You will need to run the database initialization seeds again to recreate the schema." })
          ] }),
          /* @__PURE__ */ i(ht, { children: [
            /* @__PURE__ */ t(ae, { onClick: () => V(!1), disabled: j, children: "Cancel" }),
            /* @__PURE__ */ t(
              ae,
              {
                onClick: he,
                color: "error",
                variant: "contained",
                disabled: j,
                startIcon: j ? /* @__PURE__ */ t(le, { size: 16 }) : void 0,
                children: j ? "Resetting..." : "Reset Database"
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ t(
      Mn,
      {
        open: $,
        autoHideDuration: 6e3,
        onClose: () => N(!1),
        anchorOrigin: { vertical: "bottom", horizontal: "right" },
        children: /* @__PURE__ */ t(
          Y,
          {
            onClose: () => N(!1),
            severity: y,
            sx: { width: "100%" },
            children: O
          }
        )
      }
    )
  ] });
}
function Fi() {
  return /* @__PURE__ */ t(F, { children: /* @__PURE__ */ i(W, { children: [
    /* @__PURE__ */ t(x, { variant: "h6", gutterBottom: !0, children: "Service Control" }),
    /* @__PURE__ */ t(x, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Start, stop, and restart services" }),
    /* @__PURE__ */ t(Y, { severity: "info", children: "Service control functionality coming soon. This will allow you to manage service lifecycle." })
  ] }) });
}
function Ui() {
  return /* @__PURE__ */ t(F, { children: /* @__PURE__ */ i(W, { children: [
    /* @__PURE__ */ t(x, { variant: "h6", gutterBottom: !0, children: "Environment Configuration" }),
    /* @__PURE__ */ t(x, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "View and manage environment variables" }),
    /* @__PURE__ */ t(Y, { severity: "info", children: "Environment configuration UI coming soon. This will allow you to view and edit environment variables." })
  ] }) });
}
function Vi() {
  return /* @__PURE__ */ t(F, { children: /* @__PURE__ */ i(W, { children: [
    /* @__PURE__ */ t(x, { variant: "h6", gutterBottom: !0, children: "Database Operations" }),
    /* @__PURE__ */ t(x, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Backup, restore, and maintain database" }),
    /* @__PURE__ */ t(Y, { severity: "info", children: "Database operations UI coming soon. This will allow you to backup and restore your database." })
  ] }) });
}
const Hi = ({
  open: e,
  title: r,
  message: n,
  confirmText: a,
  requiredInput: o,
  onConfirm: s,
  onCancel: l
}) => {
  const [c, h] = f(""), u = c === o;
  return /* @__PURE__ */ i(lt, { open: e, onClose: l, maxWidth: "sm", fullWidth: !0, children: [
    /* @__PURE__ */ t(ct, { children: r }),
    /* @__PURE__ */ i(dt, { children: [
      /* @__PURE__ */ t(x, { variant: "body2", sx: { mb: 2 }, children: n }),
      /* @__PURE__ */ i(x, { variant: "body2", sx: { mb: 1, fontWeight: "bold" }, children: [
        'Type "',
        o,
        '" to confirm:'
      ] }),
      /* @__PURE__ */ t(
        K,
        {
          autoFocus: !0,
          fullWidth: !0,
          value: c,
          onChange: (p) => h(p.target.value),
          placeholder: o,
          sx: { fontFamily: "monospace" }
        }
      )
    ] }),
    /* @__PURE__ */ i(ht, { children: [
      /* @__PURE__ */ t(ae, { onClick: l, children: "Cancel" }),
      /* @__PURE__ */ t(
        ae,
        {
          onClick: () => {
            u && (s(), h(""));
          },
          disabled: !u,
          variant: "contained",
          color: "error",
          children: a
        }
      )
    ] })
  ] });
}, Ki = ({
  open: e,
  onSubmit: r,
  onCancel: n
}) => {
  const [a, o] = f("postgres"), [s, l] = f("");
  return /* @__PURE__ */ i(lt, { open: e, onClose: n, maxWidth: "sm", fullWidth: !0, children: [
    /* @__PURE__ */ t(ct, { children: "Admin Credentials Required" }),
    /* @__PURE__ */ i(dt, { children: [
      /* @__PURE__ */ t(x, { variant: "body2", sx: { mb: 2 }, children: "Provide PostgreSQL admin credentials to perform this operation:" }),
      /* @__PURE__ */ t(
        K,
        {
          fullWidth: !0,
          label: "Admin User",
          value: a,
          onChange: (c) => o(c.target.value),
          sx: { mb: 2 },
          placeholder: "postgres"
        }
      ),
      /* @__PURE__ */ t(
        K,
        {
          fullWidth: !0,
          type: "password",
          label: "Admin Password",
          value: s,
          onChange: (c) => l(c.target.value),
          placeholder: "Enter admin password"
        }
      )
    ] }),
    /* @__PURE__ */ i(ht, { children: [
      /* @__PURE__ */ t(ae, { onClick: n, children: "Cancel" }),
      /* @__PURE__ */ t(
        ae,
        {
          onClick: () => {
            a && s && (r({ adminUser: a, adminPassword: s }), o("postgres"), l(""));
          },
          disabled: !a || !s,
          variant: "contained",
          children: "Continue"
        }
      )
    ] })
  ] });
}, Gi = () => {
  const e = "/api/postgres:default", r = "default", [n, a] = f(null), [o, s] = f(!0), [l, c] = f(null), [h, u] = f(!1), [p, g] = f(!1), [v, w] = f("initialize"), [b, A] = f(!1), [$, N] = f(null), O = async () => {
    try {
      const R = await fetch(`${e}/status?instance=${r}`);
      if (!R.ok) throw new Error("Failed to fetch database status");
      const d = await R.json();
      a(d), c(null);
    } catch (R) {
      c(R instanceof Error ? R.message : "Unknown error");
    } finally {
      s(!1);
    }
  };
  oe(() => {
    O();
    const R = setInterval(O, 3e4);
    return () => clearInterval(R);
  }, [e, r]);
  const E = async (R) => {
    u(!0);
    try {
      const d = await fetch(`${e}/initialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instance: r,
          ...R
        })
      });
      if (!d.ok) {
        const z = await d.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(z.message || "Failed to initialize database");
      }
      await O(), alert("Database initialized successfully");
    } catch (d) {
      alert(`Initialization failed: ${d instanceof Error ? d.message : "Unknown error"}`);
    } finally {
      u(!1), g(!1), A(!1), N(null);
    }
  }, y = async (R) => {
    u(!0);
    try {
      const d = await fetch(`${e}/recreate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instance: r,
          ...R
        })
      });
      if (!d.ok) {
        const z = await d.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(z.message || "Failed to recreate database");
      }
      await O(), alert("Database recreated successfully");
    } catch (d) {
      alert(`Recreation failed: ${d instanceof Error ? d.message : "Unknown error"}`);
    } finally {
      u(!1), g(!1), A(!1), N(null);
    }
  }, P = (R) => {
    w(R), n != null && n.adminCredentialsProvided ? R === "recreate" ? g(!0) : E() : A(!0);
  }, D = (R) => {
    N(R), A(!1), v === "recreate" ? g(!0) : E(R);
  }, V = () => {
    v === "recreate" ? y($ || void 0) : E($ || void 0);
  };
  if (o)
    return /* @__PURE__ */ t(F, { children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
      /* @__PURE__ */ t(le, { size: 20 }),
      /* @__PURE__ */ t(x, { variant: "body2", children: "Loading database status..." })
    ] }) }) });
  if (l || !n)
    return /* @__PURE__ */ t(F, { children: /* @__PURE__ */ i(W, { children: [
      /* @__PURE__ */ i(x, { variant: "h6", gutterBottom: !0, children: [
        "Database (",
        r,
        ")"
      ] }),
      /* @__PURE__ */ t(Y, { severity: "error", children: l || "Failed to load database status" })
    ] }) });
  const j = n.database ? `RECREATE ${n.database.toUpperCase()} DATABASE` : "RECREATE DATABASE", B = n.connected ? "success" : "error", ce = n.connected ? "CONNECTED" : "ERROR";
  return /* @__PURE__ */ i(je, { children: [
    /* @__PURE__ */ t(F, { children: /* @__PURE__ */ i(W, { children: [
      /* @__PURE__ */ i(m, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }, children: [
        /* @__PURE__ */ i(x, { variant: "h6", children: [
          "Database (",
          r,
          ")"
        ] }),
        /* @__PURE__ */ t(de, { label: ce, color: B, size: "small" })
      ] }),
      /* @__PURE__ */ t(x, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: h ? "Processing database operation..." : n.connected ? `Connected to ${n.database}` : n.errorMessage || "Database connection error" }),
      /* @__PURE__ */ i(m, { sx: { mb: 2 }, children: [
        /* @__PURE__ */ t(x, { variant: "caption", color: "text.secondary", children: "Connection" }),
        /* @__PURE__ */ t(x, { variant: "body2", fontWeight: "bold", children: ce })
      ] }),
      /* @__PURE__ */ i(m, { sx: { mb: 2 }, children: [
        /* @__PURE__ */ t(x, { variant: "caption", color: "text.secondary", children: "Database" }),
        /* @__PURE__ */ t(x, { variant: "body2", fontWeight: "bold", children: n.database || "N/A" })
      ] }),
      /* @__PURE__ */ i(m, { sx: { mb: 2 }, children: [
        /* @__PURE__ */ t(x, { variant: "caption", color: "text.secondary", children: "Host" }),
        /* @__PURE__ */ i(x, { variant: "body2", fontWeight: "bold", children: [
          n.host || "N/A",
          ":",
          n.port || "N/A"
        ] })
      ] }),
      !n.connected && !h && /* @__PURE__ */ i(m, { sx: { display: "flex", gap: 1, mt: 2 }, children: [
        /* @__PURE__ */ t(
          ae,
          {
            variant: "contained",
            color: "primary",
            onClick: () => P("initialize"),
            size: "small",
            children: "Initialize Database"
          }
        ),
        /* @__PURE__ */ t(
          ae,
          {
            variant: "contained",
            color: "error",
            onClick: () => P("recreate"),
            size: "small",
            children: "Recreate Database"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ t(
      Ki,
      {
        open: b,
        onSubmit: D,
        onCancel: () => {
          A(!1), N(null);
        }
      }
    ),
    /* @__PURE__ */ t(
      Hi,
      {
        open: p,
        title: "Confirm Database Recreation",
        message: `This will drop and recreate the database "${n.database}". All data will be lost. This action cannot be undone.`,
        confirmText: "Recreate",
        requiredInput: j,
        onConfirm: V,
        onCancel: () => {
          g(!1), N(null);
        }
      }
    )
  ] });
}, Qt = te(/* @__PURE__ */ t("path", {
  d: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"
}), "Delete");
function qi() {
  const [e, r] = f([]), [n, a] = f(""), [o, s] = f(null), [l, c] = f(!0), [h, u] = f(!1), [p, g] = f(null), [v, w] = f(null), [b, A] = f(!1), $ = async () => {
    try {
      const E = window.__APP_BASE_PATH__ || "", y = await fetch(`${E}/api/logs/sources`);
      if (!y.ok) throw new Error("Failed to fetch log sources");
      const P = await y.json();
      r(P.sources || []), P.sources && P.sources.length > 0 && !n && a(P.sources[0].name);
    } catch (E) {
      g(E instanceof Error ? E.message : "Failed to fetch log sources");
    }
  }, N = async () => {
    if (n) {
      c(!0), g(null);
      try {
        const E = window.__APP_BASE_PATH__ || "", y = await fetch(`${E}/api/logs/stats?source=${n}`);
        if (!y.ok) throw new Error("Failed to fetch log stats");
        const P = await y.json();
        s(P);
      } catch (E) {
        g(E instanceof Error ? E.message : "Failed to fetch log stats"), s(null);
      } finally {
        c(!1);
      }
    }
  };
  oe(() => {
    $();
  }, []), oe(() => {
    n && N();
  }, [n]);
  const O = async () => {
    A(!1), u(!0), g(null), w(null);
    try {
      const E = window.__APP_BASE_PATH__ || "", y = await fetch(`${E}/api/logs/clear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: n })
      });
      if (!y.ok) {
        const D = await y.json();
        throw new Error(D.error || "Failed to clear logs");
      }
      const P = await y.json();
      w(P.message || "Logs cleared successfully"), await N();
    } catch (E) {
      g(E instanceof Error ? E.message : "Failed to clear logs");
    } finally {
      u(!1);
    }
  };
  return /* @__PURE__ */ t(F, { children: /* @__PURE__ */ i(W, { children: [
    /* @__PURE__ */ t(x, { variant: "h6", gutterBottom: !0, children: "Log Management" }),
    /* @__PURE__ */ t(x, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "View log statistics and clear log files" }),
    p && /* @__PURE__ */ t(Y, { severity: "error", sx: { mb: 2 }, onClose: () => g(null), children: p }),
    v && /* @__PURE__ */ t(Y, { severity: "success", sx: { mb: 2 }, onClose: () => w(null), children: v }),
    /* @__PURE__ */ t(m, { sx: { mb: 2 }, children: /* @__PURE__ */ i(tr, { fullWidth: !0, size: "small", children: [
      /* @__PURE__ */ t(rr, { children: "Log Source" }),
      /* @__PURE__ */ t(
        nr,
        {
          value: n,
          label: "Log Source",
          onChange: (E) => a(E.target.value),
          disabled: e.length === 0,
          children: e.map((E) => /* @__PURE__ */ i($e, { value: E.name, children: [
            E.name,
            " (",
            E.type,
            ")"
          ] }, E.name))
        }
      )
    ] }) }),
    l ? /* @__PURE__ */ t(m, { sx: { display: "flex", justifyContent: "center", p: 3 }, children: /* @__PURE__ */ t(le, { size: 30 }) }) : o ? /* @__PURE__ */ i(m, { sx: { mb: 2 }, children: [
      /* @__PURE__ */ i(x, { variant: "body2", color: "text.secondary", children: [
        /* @__PURE__ */ t("strong", { children: "Total Logs:" }),
        " ",
        o.totalLogs.toLocaleString()
      ] }),
      /* @__PURE__ */ i(x, { variant: "body2", color: "text.secondary", children: [
        /* @__PURE__ */ t("strong", { children: "File Size:" }),
        " ",
        o.fileSizeFormatted
      ] }),
      /* @__PURE__ */ t(x, { variant: "body2", color: "text.secondary", sx: { mt: 1 }, children: /* @__PURE__ */ t("strong", { children: "By Level:" }) }),
      /* @__PURE__ */ i(m, { sx: { pl: 2 }, children: [
        /* @__PURE__ */ i(x, { variant: "body2", color: "text.secondary", children: [
          "Debug: ",
          o.byLevel.debug.toLocaleString()
        ] }),
        /* @__PURE__ */ i(x, { variant: "body2", color: "text.secondary", children: [
          "Info: ",
          o.byLevel.info.toLocaleString()
        ] }),
        /* @__PURE__ */ i(x, { variant: "body2", color: "text.secondary", children: [
          "Warn: ",
          o.byLevel.warn.toLocaleString()
        ] }),
        /* @__PURE__ */ i(x, { variant: "body2", color: "error", children: [
          "Error: ",
          o.byLevel.error.toLocaleString()
        ] })
      ] })
    ] }) : null,
    /* @__PURE__ */ i(m, { sx: { display: "flex", gap: 1 }, children: [
      /* @__PURE__ */ t(
        ae,
        {
          variant: "outlined",
          color: "primary",
          size: "small",
          startIcon: /* @__PURE__ */ t(mt, {}),
          onClick: N,
          disabled: !n || l,
          children: "Refresh"
        }
      ),
      /* @__PURE__ */ t(
        ae,
        {
          variant: "contained",
          color: "error",
          size: "small",
          startIcon: h ? /* @__PURE__ */ t(le, { size: 16, color: "inherit" }) : /* @__PURE__ */ t(Qt, {}),
          onClick: () => A(!0),
          disabled: !n || h || l,
          children: "Clear Logs"
        }
      )
    ] }),
    /* @__PURE__ */ i(lt, { open: b, onClose: () => A(!1), children: [
      /* @__PURE__ */ t(ct, { children: "Clear Log File" }),
      /* @__PURE__ */ t(dt, { children: /* @__PURE__ */ i(Rn, { children: [
        'Are you sure you want to clear the "',
        n,
        '" log file? This action cannot be undone.'
      ] }) }),
      /* @__PURE__ */ i(ht, { children: [
        /* @__PURE__ */ t(ae, { onClick: () => A(!1), children: "Cancel" }),
        /* @__PURE__ */ t(ae, { onClick: O, color: "error", variant: "contained", children: "Clear" })
      ] })
    ] })
  ] }) });
}
function Ji() {
  const [e, r] = f(null), [n, a] = f(!0), [o, s] = f(!1), [l, c] = f(null), [h, u] = f(null), [p, g] = f(!1), v = async () => {
    a(!0), c(null);
    try {
      const b = window.__APP_BASE_PATH__ || "", A = await fetch(`${b}/api/cache:default/stats`);
      if (!A.ok)
        throw A.status === 404 ? new Error("Cache plugin not configured") : new Error("Failed to fetch cache stats");
      const $ = await A.json();
      r($);
    } catch (b) {
      c(b instanceof Error ? b.message : "Failed to fetch cache stats"), r(null);
    } finally {
      a(!1);
    }
  };
  oe(() => {
    v();
  }, []);
  const w = async () => {
    g(!1), s(!0), c(null), u(null);
    try {
      const b = window.__APP_BASE_PATH__ || "", A = await fetch(`${b}/api/cache:default/flush`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!A.ok) {
        const N = await A.json();
        throw new Error(N.error || "Failed to flush cache");
      }
      const $ = await A.json();
      u(
        $.message + ($.deletedCount !== void 0 ? ` (${$.deletedCount} keys deleted)` : "")
      ), await v();
    } catch (b) {
      c(b instanceof Error ? b.message : "Failed to flush cache");
    } finally {
      s(!1);
    }
  };
  return /* @__PURE__ */ t(F, { children: /* @__PURE__ */ i(W, { children: [
    /* @__PURE__ */ t(x, { variant: "h6", gutterBottom: !0, children: "Cache Management" }),
    /* @__PURE__ */ t(x, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "View cache statistics and clear cache" }),
    l && /* @__PURE__ */ t(Y, { severity: "error", sx: { mb: 2 }, onClose: () => c(null), children: l }),
    h && /* @__PURE__ */ t(Y, { severity: "success", sx: { mb: 2 }, onClose: () => u(null), children: h }),
    n ? /* @__PURE__ */ t(m, { sx: { display: "flex", justifyContent: "center", p: 3 }, children: /* @__PURE__ */ t(le, { size: 30 }) }) : e ? /* @__PURE__ */ i(m, { sx: { mb: 2 }, children: [
      /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 1 }, children: [
        /* @__PURE__ */ t(x, { variant: "body2", color: "text.secondary", children: /* @__PURE__ */ t("strong", { children: "Status:" }) }),
        /* @__PURE__ */ t(
          de,
          {
            size: "small",
            icon: e.connected ? /* @__PURE__ */ t(Me, {}) : /* @__PURE__ */ t(Ne, {}),
            label: e.connected ? "Connected" : "Disconnected",
            color: e.connected ? "success" : "error"
          }
        )
      ] }),
      /* @__PURE__ */ i(x, { variant: "body2", color: "text.secondary", children: [
        /* @__PURE__ */ t("strong", { children: "Key Count:" }),
        " ",
        e.keyCount.toLocaleString()
      ] }),
      e.usedMemory && /* @__PURE__ */ i(x, { variant: "body2", color: "text.secondary", children: [
        /* @__PURE__ */ t("strong", { children: "Memory Used:" }),
        " ",
        e.usedMemory
      ] })
    ] }) : null,
    /* @__PURE__ */ i(m, { sx: { display: "flex", gap: 1 }, children: [
      /* @__PURE__ */ t(
        ae,
        {
          variant: "outlined",
          color: "primary",
          size: "small",
          startIcon: /* @__PURE__ */ t(mt, {}),
          onClick: v,
          disabled: n,
          children: "Refresh"
        }
      ),
      /* @__PURE__ */ t(
        ae,
        {
          variant: "contained",
          color: "error",
          size: "small",
          startIcon: o ? /* @__PURE__ */ t(le, { size: 16, color: "inherit" }) : /* @__PURE__ */ t(Qt, {}),
          onClick: () => g(!0),
          disabled: !e || !e.connected || o || n,
          children: "Flush Cache"
        }
      )
    ] }),
    /* @__PURE__ */ i(lt, { open: p, onClose: () => g(!1), children: [
      /* @__PURE__ */ t(ct, { children: "Flush Cache" }),
      /* @__PURE__ */ t(dt, { children: /* @__PURE__ */ i(Rn, { children: [
        "Are you sure you want to flush the cache? This will delete",
        " ",
        e == null ? void 0 : e.keyCount.toLocaleString(),
        " keys. This action cannot be undone."
      ] }) }),
      /* @__PURE__ */ i(ht, { children: [
        /* @__PURE__ */ t(ae, { onClick: () => g(!1), children: "Cancel" }),
        /* @__PURE__ */ t(ae, { onClick: w, color: "error", variant: "contained", children: "Flush" })
      ] })
    ] })
  ] }) });
}
const $r = 1e5, Br = 10;
function _r(e, r = 0) {
  return r > Br ? !0 : e && typeof e == "object" && !Array.isArray(e) ? Object.values(e).some((n) => _r(n, r + 1)) : Array.isArray(e) ? e.some((n) => _r(n, r + 1)) : !1;
}
function Qi() {
  const [e, r] = f("{}"), [n, a] = f(!0), [o, s] = f(!1), [l, c] = f(null), [h, u] = f(!1), [p, g] = f(null), [v, w] = f(!1);
  oe(() => {
    (async () => {
      try {
        const P = await Q.getPreferences();
        r(JSON.stringify(P.preferences, null, 2)), c(null);
      } catch (P) {
        c(P instanceof Error ? P.message : "Failed to load preferences");
      } finally {
        a(!1);
      }
    })();
  }, []);
  const b = (y) => {
    r(y), w(!0), u(!1);
    try {
      const P = JSON.parse(y);
      if (_r(P)) {
        g(`Preferences object too deeply nested (max ${Br} levels)`);
        return;
      }
      g(null);
    } catch (P) {
      g(P instanceof Error ? P.message : "Invalid JSON");
    }
  }, A = async () => {
    if (!p)
      try {
        const y = JSON.parse(e);
        s(!0), c(null);
        const P = await Q.updatePreferences(y);
        r(JSON.stringify(P.preferences, null, 2)), u(!0), w(!1);
      } catch (y) {
        c(y instanceof Error ? y.message : "Failed to save preferences");
      } finally {
        s(!1);
      }
  }, $ = async () => {
    if (confirm("Reset all preferences to defaults? This cannot be undone."))
      try {
        s(!0), c(null), await Q.deletePreferences();
        const y = await Q.getPreferences();
        r(JSON.stringify(y.preferences, null, 2)), u(!0), w(!1);
      } catch (y) {
        c(y instanceof Error ? y.message : "Failed to reset preferences");
      } finally {
        s(!1);
      }
  }, N = () => {
    try {
      const y = JSON.parse(e);
      r(JSON.stringify(y, null, 2)), g(null);
    } catch {
    }
  };
  if (n)
    return /* @__PURE__ */ t(m, { sx: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }, children: /* @__PURE__ */ t(le, {}) });
  const O = e.length, E = O / $r * 100;
  return /* @__PURE__ */ i(m, { children: [
    /* @__PURE__ */ i(m, { sx: { mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
      /* @__PURE__ */ i(m, { children: [
        /* @__PURE__ */ t(x, { variant: "h4", sx: { color: "var(--theme-text-primary)" }, children: "Preferences" }),
        /* @__PURE__ */ t(x, { variant: "body2", sx: { color: "var(--theme-text-secondary)", mt: 0.5 }, children: "Manage your user preferences as JSON" })
      ] }),
      /* @__PURE__ */ t(m, { sx: { display: "flex", gap: 1 }, children: /* @__PURE__ */ t(
        de,
        {
          label: `${O.toLocaleString()} / ${$r.toLocaleString()} bytes`,
          size: "small",
          color: E > 90 ? "error" : E > 75 ? "warning" : "default"
        }
      ) })
    ] }),
    l && /* @__PURE__ */ t(Y, { severity: "error", sx: { mb: 2 }, onClose: () => c(null), children: l }),
    h && /* @__PURE__ */ t(Y, { severity: "success", sx: { mb: 2 }, onClose: () => u(!1), children: "Preferences saved successfully" }),
    /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", mb: 2 }, children: /* @__PURE__ */ i(W, { children: [
      /* @__PURE__ */ i(m, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }, children: [
        /* @__PURE__ */ t(x, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: "Preferences JSON" }),
        /* @__PURE__ */ t(
          me,
          {
            variant: "outlined",
            onClick: N,
            disabled: !!p,
            children: "Format JSON"
          }
        )
      ] }),
      /* @__PURE__ */ t(
        K,
        {
          fullWidth: !0,
          multiline: !0,
          rows: 20,
          value: e,
          onChange: (y) => b(y.target.value),
          error: !!p,
          helperText: p || `Edit your preferences as JSON. Max ${$r.toLocaleString()} bytes, max ${Br} levels deep.`,
          sx: {
            "& .MuiInputBase-root": {
              fontFamily: "monospace",
              fontSize: "0.875rem"
            }
          }
        }
      )
    ] }) }),
    /* @__PURE__ */ i(m, { sx: { display: "flex", gap: 2, justifyContent: "flex-end" }, children: [
      /* @__PURE__ */ t(
        me,
        {
          variant: "outlined",
          onClick: $,
          disabled: o,
          color: "error",
          children: "Reset to Defaults"
        }
      ),
      /* @__PURE__ */ t(
        me,
        {
          variant: "contained",
          onClick: A,
          disabled: !!p || !v || o,
          loading: o,
          children: "Save Preferences"
        }
      )
    ] })
  ] });
}
function Yi() {
  return [
    { name: "ServiceHealthWidget", component: $i },
    { name: "IntegrationStatusWidget", component: Ai },
    { name: "AuthStatusWidget", component: Pi },
    { name: "NotificationsStatsWidget", component: Bi },
    { name: "CMSStatusWidget", component: Mi },
    { name: "CMSMaintenanceWidget", component: Ri },
    { name: "SeedManagementWidget", component: ji },
    { name: "ServiceControlWidget", component: Fi },
    { name: "EnvironmentConfigWidget", component: Ui },
    { name: "DatabaseOpsWidget", component: Vi },
    { name: "DatabaseOperationsWidget", component: Gi },
    { name: "LogsMaintenanceWidget", component: qi },
    { name: "CacheMaintenanceWidget", component: Ji },
    { name: "PreferencesPage", component: Qi }
  ];
}
function Xi(e) {
  switch (e) {
    case "healthy":
      return /* @__PURE__ */ t(Me, { sx: { color: "var(--theme-success)" } });
    case "degraded":
      return /* @__PURE__ */ t(Kt, { sx: { color: "var(--theme-warning)" } });
    case "unhealthy":
      return /* @__PURE__ */ t(Ne, { sx: { color: "var(--theme-error)" } });
    default:
      return /* @__PURE__ */ t(le, { size: 20 });
  }
}
function Ar(e) {
  switch (e) {
    case "healthy":
      return "var(--theme-success)";
    case "degraded":
      return "var(--theme-warning)";
    case "unhealthy":
      return "var(--theme-error)";
    default:
      return "var(--theme-text-secondary)";
  }
}
function Zi() {
  var v, w;
  const e = Nn(), [r, n] = f(null), [a, o] = f(null), [s, l] = f(!0), [c, h] = f(null);
  if (oe(() => {
    const b = async () => {
      try {
        const [$, N] = await Promise.all([
          Q.getHealth(),
          Q.getInfo()
        ]);
        n($), o(N), h(null);
      } catch ($) {
        h($ instanceof Error ? $.message : "Failed to fetch data");
      } finally {
        l(!1);
      }
    };
    b();
    const A = setInterval(b, 1e4);
    return () => clearInterval(A);
  }, []), s)
    return /* @__PURE__ */ t(m, { sx: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }, children: /* @__PURE__ */ t(le, {}) });
  if (c)
    return /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", border: "1px solid var(--theme-error)" }, children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ t(x, { color: "error", children: c }) }) });
  const u = r ? Object.entries(r.checks) : [], p = u.filter(([, b]) => b.status === "healthy").length, g = u.length;
  return /* @__PURE__ */ i(m, { children: [
    /* @__PURE__ */ t(x, { variant: "h4", sx: { mb: 1, color: "var(--theme-text-primary)" }, children: "Dashboard" }),
    /* @__PURE__ */ i(x, { variant: "body2", sx: { mb: 4, color: "var(--theme-text-secondary)" }, children: [
      "Real-time overview of ",
      (a == null ? void 0 : a.product) || "your service"
    ] }),
    /* @__PURE__ */ t(
      F,
      {
        sx: {
          mb: 4,
          bgcolor: "var(--theme-surface)",
          border: `2px solid ${Ar((r == null ? void 0 : r.status) || "unknown")}`
        },
        children: /* @__PURE__ */ t(Da, { onClick: () => e("/health"), children: /* @__PURE__ */ i(W, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
          /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
            Xi((r == null ? void 0 : r.status) || "unknown"),
            /* @__PURE__ */ i(m, { children: [
              /* @__PURE__ */ i(x, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: [
                "Service Status: ",
                (v = r == null ? void 0 : r.status) == null ? void 0 : v.charAt(0).toUpperCase(),
                (w = r == null ? void 0 : r.status) == null ? void 0 : w.slice(1)
              ] }),
              /* @__PURE__ */ t(x, { variant: "body2", sx: { color: "var(--theme-text-secondary)" }, children: "Click to view detailed health information" })
            ] })
          ] }),
          /* @__PURE__ */ t(
            de,
            {
              label: `${p}/${g} checks passing`,
              sx: {
                bgcolor: Ar((r == null ? void 0 : r.status) || "unknown") + "20",
                color: Ar((r == null ? void 0 : r.status) || "unknown")
              }
            }
          )
        ] }) })
      }
    ),
    /* @__PURE__ */ t(ki, { widgetType: "status" }),
    /* @__PURE__ */ t(Ci, {})
  ] });
}
const Vr = te(/* @__PURE__ */ t("path", {
  d: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14"
}), "Search"), el = te(/* @__PURE__ */ t("path", {
  d: "M6 19h4V5H6zm8-14v14h4V5z"
}), "Pause"), tl = te(/* @__PURE__ */ t("path", {
  d: "m4 12 1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8z"
}), "ArrowUpward"), rl = te(/* @__PURE__ */ t("path", {
  d: "m20 12-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8z"
}), "ArrowDownward"), nl = te(/* @__PURE__ */ t("path", {
  d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m1 15h-2v-6h2zm0-8h-2V7h2z"
}), "Info"), al = te(/* @__PURE__ */ t("path", {
  d: "M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5s-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20zm-6 8h-4v-2h4zm0-4h-4v-2h4z"
}), "BugReport");
function Sn(e) {
  switch (e.toLowerCase()) {
    case "error":
      return "var(--theme-error)";
    case "warn":
    case "warning":
      return "var(--theme-warning)";
    case "info":
      return "var(--theme-info)";
    case "debug":
      return "var(--theme-text-secondary)";
    default:
      return "var(--theme-text-primary)";
  }
}
function ol() {
  const [e, r] = f([]), [n, a] = f([]), [o, s] = f(!0), [l, c] = f(null), [h, u] = f(""), [p, g] = f(""), [v, w] = f(""), [b, A] = f(1), [$, N] = f(0), O = 50, [E, y] = f(!1), [P, D] = f("desc"), V = Sa(null), j = {
    total: $,
    errors: e.filter((C) => C.level.toLowerCase() === "error").length,
    warnings: e.filter((C) => ["warn", "warning"].includes(C.level.toLowerCase())).length,
    info: e.filter((C) => C.level.toLowerCase() === "info").length,
    debug: e.filter((C) => C.level.toLowerCase() === "debug").length
  }, B = Se(async () => {
    s(!0);
    try {
      const C = await Q.getLogs({
        source: h || void 0,
        level: p || void 0,
        search: v || void 0,
        limit: O,
        page: b
      }), M = [...C.logs].sort((U, he) => {
        const G = new Date(U.timestamp).getTime(), be = new Date(he.timestamp).getTime();
        return P === "desc" ? be - G : G - be;
      });
      r(M), N(C.total), c(null);
    } catch (C) {
      c(C instanceof Error ? C.message : "Failed to fetch logs");
    } finally {
      s(!1);
    }
  }, [h, p, v, b, P]), ce = async () => {
    try {
      const C = await Q.getLogSources();
      a(C);
    } catch {
    }
  };
  oe(() => {
    ce();
  }, []), oe(() => {
    B();
  }, [B]), oe(() => (E ? V.current = setInterval(B, 5e3) : V.current && (clearInterval(V.current), V.current = null), () => {
    V.current && clearInterval(V.current);
  }), [E, B]);
  const R = () => {
    A(1), B();
  }, d = (C, M) => {
    M !== null && D(M);
  }, z = Math.ceil($ / O);
  return /* @__PURE__ */ i(m, { children: [
    /* @__PURE__ */ t(x, { variant: "h4", sx: { mb: 1, color: "var(--theme-text-primary)" }, children: "Logs" }),
    /* @__PURE__ */ t(x, { variant: "body2", sx: { mb: 4, color: "var(--theme-text-secondary)" }, children: "View and search application logs" }),
    /* @__PURE__ */ i(Ae, { container: !0, spacing: 2, sx: { mb: 3 }, children: [
      /* @__PURE__ */ t(Ae, { size: { xs: 6, sm: 3, md: 2.4 }, children: /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ i(W, { sx: { py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }, children: [
        /* @__PURE__ */ t(m, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: /* @__PURE__ */ t(x, { variant: "h5", sx: { color: "var(--theme-text-primary)", fontWeight: 600 }, children: j.total.toLocaleString() }) }),
        /* @__PURE__ */ t(x, { variant: "caption", sx: { color: "var(--theme-text-secondary)" }, children: "Total Logs" })
      ] }) }) }),
      /* @__PURE__ */ t(Ae, { size: { xs: 6, sm: 3, md: 2.4 }, children: /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ i(W, { sx: { py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }, children: [
        /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
          /* @__PURE__ */ t(Ne, { sx: { color: "var(--theme-error)", fontSize: 20 } }),
          /* @__PURE__ */ t(x, { variant: "h5", sx: { color: "var(--theme-error)", fontWeight: 600 }, children: j.errors })
        ] }),
        /* @__PURE__ */ t(x, { variant: "caption", sx: { color: "var(--theme-text-secondary)" }, children: "Errors" })
      ] }) }) }),
      /* @__PURE__ */ t(Ae, { size: { xs: 6, sm: 3, md: 2.4 }, children: /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ i(W, { sx: { py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }, children: [
        /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
          /* @__PURE__ */ t(Kt, { sx: { color: "var(--theme-warning)", fontSize: 20 } }),
          /* @__PURE__ */ t(x, { variant: "h5", sx: { color: "var(--theme-warning)", fontWeight: 600 }, children: j.warnings })
        ] }),
        /* @__PURE__ */ t(x, { variant: "caption", sx: { color: "var(--theme-text-secondary)" }, children: "Warnings" })
      ] }) }) }),
      /* @__PURE__ */ t(Ae, { size: { xs: 6, sm: 3, md: 2.4 }, children: /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ i(W, { sx: { py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }, children: [
        /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
          /* @__PURE__ */ t(nl, { sx: { color: "var(--theme-info)", fontSize: 20 } }),
          /* @__PURE__ */ t(x, { variant: "h5", sx: { color: "var(--theme-info)", fontWeight: 600 }, children: j.info })
        ] }),
        /* @__PURE__ */ t(x, { variant: "caption", sx: { color: "var(--theme-text-secondary)" }, children: "Info" })
      ] }) }) }),
      /* @__PURE__ */ t(Ae, { size: { xs: 6, sm: 3, md: 2.4 }, children: /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ i(W, { sx: { py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }, children: [
        /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
          /* @__PURE__ */ t(al, { sx: { color: "var(--theme-text-secondary)", fontSize: 20 } }),
          /* @__PURE__ */ t(x, { variant: "h5", sx: { color: "var(--theme-text-primary)", fontWeight: 600 }, children: j.debug })
        ] }),
        /* @__PURE__ */ t(x, { variant: "caption", sx: { color: "var(--theme-text-secondary)" }, children: "Debug" })
      ] }) }) })
    ] }),
    /* @__PURE__ */ t(F, { sx: { mb: 3, bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ i(m, { sx: { display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }, children: [
      n.length > 0 && /* @__PURE__ */ i(tr, { size: "small", sx: { minWidth: 150 }, children: [
        /* @__PURE__ */ t(rr, { sx: { color: "var(--theme-text-secondary)" }, children: "Source" }),
        /* @__PURE__ */ i(
          nr,
          {
            value: h,
            label: "Source",
            onChange: (C) => u(C.target.value),
            sx: { color: "var(--theme-text-primary)" },
            children: [
              /* @__PURE__ */ t($e, { value: "", children: "All Sources" }),
              n.map((C) => /* @__PURE__ */ t($e, { value: C.name, children: C.name }, C.name))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ i(tr, { size: "small", sx: { minWidth: 120 }, children: [
        /* @__PURE__ */ t(rr, { sx: { color: "var(--theme-text-secondary)" }, children: "Level" }),
        /* @__PURE__ */ i(
          nr,
          {
            value: p,
            label: "Level",
            onChange: (C) => g(C.target.value),
            sx: { color: "var(--theme-text-primary)" },
            children: [
              /* @__PURE__ */ t($e, { value: "", children: "All Levels" }),
              /* @__PURE__ */ t($e, { value: "error", children: "Error" }),
              /* @__PURE__ */ t($e, { value: "warn", children: "Warning" }),
              /* @__PURE__ */ t($e, { value: "info", children: "Info" }),
              /* @__PURE__ */ t($e, { value: "debug", children: "Debug" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ t(
        K,
        {
          size: "small",
          placeholder: "Search logs...",
          value: v,
          onChange: (C) => w(C.target.value),
          onKeyPress: (C) => C.key === "Enter" && R(),
          sx: {
            flex: 1,
            minWidth: 200,
            "& .MuiInputBase-input": { color: "var(--theme-text-primary)" }
          },
          InputProps: {
            startAdornment: /* @__PURE__ */ t(Vr, { sx: { mr: 1, color: "var(--theme-text-secondary)" } })
          }
        }
      ),
      /* @__PURE__ */ i(
        Na,
        {
          value: P,
          exclusive: !0,
          onChange: d,
          size: "small",
          "aria-label": "sort order",
          children: [
            /* @__PURE__ */ t(Zr, { value: "desc", "aria-label": "newest first", children: /* @__PURE__ */ t(Pe, { title: "Newest First", children: /* @__PURE__ */ t(rl, { fontSize: "small" }) }) }),
            /* @__PURE__ */ t(Zr, { value: "asc", "aria-label": "oldest first", children: /* @__PURE__ */ t(Pe, { title: "Oldest First", children: /* @__PURE__ */ t(tl, { fontSize: "small" }) }) })
          ]
        }
      ),
      /* @__PURE__ */ t(Pe, { title: E ? "Pause auto-refresh" : "Enable auto-refresh (5s)", children: /* @__PURE__ */ t(
        Be,
        {
          onClick: () => y(!E),
          sx: {
            color: E ? "var(--theme-success)" : "var(--theme-text-secondary)",
            bgcolor: E ? "var(--theme-success)20" : "transparent"
          },
          children: E ? /* @__PURE__ */ t(el, {}) : /* @__PURE__ */ t(At, {})
        }
      ) }),
      /* @__PURE__ */ t(Pe, { title: "Refresh", children: /* @__PURE__ */ t(Be, { onClick: B, sx: { color: "var(--theme-primary)" }, children: /* @__PURE__ */ t(mt, {}) }) })
    ] }) }) }),
    l && /* @__PURE__ */ t(F, { sx: { mb: 3, bgcolor: "var(--theme-surface)", border: "1px solid var(--theme-error)" }, children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ t(x, { color: "error", children: l }) }) }),
    /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: o ? /* @__PURE__ */ t(m, { sx: { display: "flex", justifyContent: "center", p: 4 }, children: /* @__PURE__ */ t(le, {}) }) : e.length === 0 ? /* @__PURE__ */ t(W, { children: /* @__PURE__ */ t(x, { sx: { color: "var(--theme-text-secondary)", textAlign: "center" }, children: "No logs found" }) }) : /* @__PURE__ */ i(je, { children: [
      /* @__PURE__ */ t(nt, { children: /* @__PURE__ */ i(at, { size: "small", children: [
        /* @__PURE__ */ t(ot, { children: /* @__PURE__ */ i(xe, { children: [
          /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", width: 180 }, children: "Timestamp" }),
          /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", width: 100 }, children: "Level" }),
          /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", width: 120 }, children: "Component" }),
          /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Message" })
        ] }) }),
        /* @__PURE__ */ t(st, { children: e.map((C, M) => /* @__PURE__ */ i(xe, { hover: !0, children: [
          /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", fontFamily: "monospace", fontSize: "0.75rem" }, children: new Date(C.timestamp).toLocaleString() }),
          /* @__PURE__ */ t(_, { sx: { borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(
            de,
            {
              label: C.level.toUpperCase(),
              size: "small",
              sx: {
                bgcolor: Sn(C.level) + "20",
                color: Sn(C.level),
                fontSize: "0.65rem",
                height: 20
              }
            }
          ) }),
          /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", fontSize: "0.75rem" }, children: C.namespace || "-" }),
          /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)", fontFamily: "monospace", fontSize: "0.8rem", whiteSpace: "pre-wrap", wordBreak: "break-all" }, children: C.message })
        ] }, M)) })
      ] }) }),
      z > 1 && /* @__PURE__ */ t(m, { sx: { display: "flex", justifyContent: "center", p: 2 }, children: /* @__PURE__ */ t(
        za,
        {
          count: z,
          page: b,
          onChange: (C, M) => A(M),
          sx: {
            "& .MuiPaginationItem-root": {
              color: "var(--theme-text-primary)"
            }
          }
        }
      ) })
    ] }) })
  ] });
}
const Hr = te(/* @__PURE__ */ t("path", {
  d: "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m0 16H8V7h11z"
}), "ContentCopy"), sl = te(/* @__PURE__ */ t("path", {
  d: "M15 9H9v6h6zm-2 4h-2v-2h2zm8-2V9h-2V7c0-1.1-.9-2-2-2h-2V3h-2v2h-2V3H9v2H7c-1.1 0-2 .9-2 2v2H3v2h2v2H3v2h2v2c0 1.1.9 2 2 2h2v2h2v-2h2v2h2v-2h2c1.1 0 2-.9 2-2v-2h2v-2h-2v-2zm-4 6H7V7h10z"
}), "Memory"), il = te(/* @__PURE__ */ t("path", {
  d: "M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2zM4 6h16v10H4z"
}), "Computer"), ll = te(/* @__PURE__ */ t("path", {
  d: "M2 20h20v-4H2zm2-3h2v2H4zM2 4v4h20V4zm4 3H4V5h2zm-4 7h20v-4H2zm2-3h2v2H4z"
}), "Storage"), cl = te([/* @__PURE__ */ t("path", {
  d: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8"
}, "0"), /* @__PURE__ */ t("path", {
  d: "M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"
}, "1")], "AccessTime"), dl = te(/* @__PURE__ */ t("path", {
  d: "m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z"
}), "Favorite");
function Tr(e) {
  if (e === 0) return "0 B";
  const r = 1024, n = ["B", "KB", "MB", "GB"], a = Math.floor(Math.log(e) / Math.log(r));
  return parseFloat((e / Math.pow(r, a)).toFixed(2)) + " " + n[a];
}
function hl(e) {
  const r = Math.floor(e / 1e3), n = Math.floor(r / 60), a = Math.floor(n / 60), o = Math.floor(a / 24);
  return o > 0 ? `${o}d ${a % 24}h ${n % 60}m` : a > 0 ? `${a}h ${n % 60}m ${r % 60}s` : n > 0 ? `${n}m ${r % 60}s` : `${r}s`;
}
function ul(e, r = 20) {
  switch (e) {
    case "healthy":
      return /* @__PURE__ */ t(Me, { sx: { color: "var(--theme-success)", fontSize: r } });
    case "degraded":
      return /* @__PURE__ */ t(Kt, { sx: { color: "var(--theme-warning)", fontSize: r } });
    case "unhealthy":
      return /* @__PURE__ */ t(Ne, { sx: { color: "var(--theme-error)", fontSize: r } });
    default:
      return /* @__PURE__ */ t(le, { size: r });
  }
}
function Lt(e) {
  switch (e) {
    case "healthy":
      return "var(--theme-success)";
    case "degraded":
      return "var(--theme-warning)";
    case "unhealthy":
      return "var(--theme-error)";
    default:
      return "var(--theme-text-secondary)";
  }
}
function ml(e) {
  return e === void 0 ? "-" : e < 1e3 ? `${e}ms` : `${(e / 1e3).toFixed(2)}s`;
}
function fl() {
  const [e, r] = f(null), [n, a] = f(null), [o, s] = f(!0), [l, c] = f(null), [h, u] = f({
    open: !1,
    message: ""
  }), p = async () => {
    s(!0);
    try {
      const [w, b] = await Promise.all([
        Q.getDiagnostics(),
        Q.getHealth().catch(() => null)
        // Health might not be available
      ]);
      r(w), a(b), c(null);
    } catch (w) {
      c(w instanceof Error ? w.message : "Failed to fetch diagnostics");
    } finally {
      s(!1);
    }
  };
  oe(() => {
    p();
    const w = setInterval(p, 3e4);
    return () => clearInterval(w);
  }, []);
  const g = () => {
    navigator.clipboard.writeText(JSON.stringify(e, null, 2)), u({ open: !0, message: "Diagnostics copied to clipboard" });
  };
  if (o && !e)
    return /* @__PURE__ */ t(m, { sx: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }, children: /* @__PURE__ */ t(le, {}) });
  if (l)
    return /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", border: "1px solid var(--theme-error)" }, children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ t(x, { color: "error", children: l }) }) });
  const v = e ? e.system.memory.used / e.system.memory.total * 100 : 0;
  return /* @__PURE__ */ i(m, { children: [
    /* @__PURE__ */ i(m, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }, children: [
      /* @__PURE__ */ t(x, { variant: "h4", sx: { color: "var(--theme-text-primary)" }, children: "System" }),
      /* @__PURE__ */ i(m, { sx: { display: "flex", gap: 1 }, children: [
        /* @__PURE__ */ t(Pe, { title: "Copy diagnostics JSON", children: /* @__PURE__ */ t(Be, { onClick: g, sx: { color: "var(--theme-primary)" }, children: /* @__PURE__ */ t(Hr, {}) }) }),
        /* @__PURE__ */ t(Pe, { title: "Refresh", children: /* @__PURE__ */ t(Be, { onClick: p, sx: { color: "var(--theme-primary)" }, children: /* @__PURE__ */ t(mt, {}) }) })
      ] })
    ] }),
    /* @__PURE__ */ t(x, { variant: "body2", sx: { mb: 4, color: "var(--theme-text-secondary)" }, children: "System information and diagnostics" }),
    /* @__PURE__ */ i(Ae, { container: !0, spacing: 3, children: [
      /* @__PURE__ */ t(Ae, { size: { xs: 12, md: 6 }, children: /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", height: "100%" }, children: /* @__PURE__ */ i(W, { children: [
        /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 3 }, children: [
          /* @__PURE__ */ t(il, { sx: { color: "var(--theme-primary)" } }),
          /* @__PURE__ */ t(x, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: "System Information" })
        ] }),
        /* @__PURE__ */ i(m, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: [
          /* @__PURE__ */ i(m, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(x, { sx: { color: "var(--theme-text-secondary)" }, children: "QwickApps Server" }),
            /* @__PURE__ */ t(
              de,
              {
                label: e != null && e.frameworkVersion ? `v${e.frameworkVersion}` : "N/A",
                size: "small",
                sx: { bgcolor: "var(--theme-primary)20", color: "var(--theme-primary)" }
              }
            )
          ] }),
          /* @__PURE__ */ i(m, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(x, { sx: { color: "var(--theme-text-secondary)" }, children: "Node.js" }),
            /* @__PURE__ */ t(
              de,
              {
                label: e == null ? void 0 : e.system.nodeVersion,
                size: "small",
                sx: { bgcolor: "var(--theme-background)", color: "var(--theme-text-primary)" }
              }
            )
          ] }),
          /* @__PURE__ */ i(m, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(x, { sx: { color: "var(--theme-text-secondary)" }, children: "Platform" }),
            /* @__PURE__ */ t(
              de,
              {
                label: e == null ? void 0 : e.system.platform,
                size: "small",
                sx: { bgcolor: "var(--theme-background)", color: "var(--theme-text-primary)" }
              }
            )
          ] }),
          /* @__PURE__ */ i(m, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(x, { sx: { color: "var(--theme-text-secondary)" }, children: "Architecture" }),
            /* @__PURE__ */ t(
              de,
              {
                label: e == null ? void 0 : e.system.arch,
                size: "small",
                sx: { bgcolor: "var(--theme-background)", color: "var(--theme-text-primary)" }
              }
            )
          ] })
        ] })
      ] }) }) }),
      /* @__PURE__ */ t(Ae, { size: { xs: 12, md: 6 }, children: /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", height: "100%" }, children: /* @__PURE__ */ i(W, { children: [
        /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 3 }, children: [
          /* @__PURE__ */ t(sl, { sx: { color: "var(--theme-warning)" } }),
          /* @__PURE__ */ t(x, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: "Memory Usage" })
        ] }),
        /* @__PURE__ */ i(m, { sx: { mb: 2 }, children: [
          /* @__PURE__ */ i(m, { sx: { display: "flex", justifyContent: "space-between", mb: 1 }, children: [
            /* @__PURE__ */ t(x, { sx: { color: "var(--theme-text-secondary)" }, children: "Heap Used" }),
            /* @__PURE__ */ t(x, { sx: { color: "var(--theme-text-primary)" }, children: Tr((e == null ? void 0 : e.system.memory.used) || 0) })
          ] }),
          /* @__PURE__ */ t(
            Gt,
            {
              variant: "determinate",
              value: v,
              sx: {
                height: 8,
                borderRadius: 4,
                bgcolor: "var(--theme-background)",
                "& .MuiLinearProgress-bar": {
                  bgcolor: v > 80 ? "var(--theme-error)" : "var(--theme-warning)",
                  borderRadius: 4
                }
              }
            }
          )
        ] }),
        /* @__PURE__ */ i(m, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: [
          /* @__PURE__ */ i(m, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(x, { sx: { color: "var(--theme-text-secondary)" }, children: "Heap Total" }),
            /* @__PURE__ */ t(x, { sx: { color: "var(--theme-text-primary)" }, children: Tr((e == null ? void 0 : e.system.memory.total) || 0) })
          ] }),
          /* @__PURE__ */ i(m, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(x, { sx: { color: "var(--theme-text-secondary)" }, children: "Heap Free" }),
            /* @__PURE__ */ t(x, { sx: { color: "var(--theme-text-primary)" }, children: Tr((e == null ? void 0 : e.system.memory.free) || 0) })
          ] })
        ] })
      ] }) }) }),
      /* @__PURE__ */ t(Ae, { size: { xs: 12, md: 6 }, children: /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", height: "100%" }, children: /* @__PURE__ */ i(W, { children: [
        /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 3 }, children: [
          /* @__PURE__ */ t(ll, { sx: { color: "var(--theme-info)" } }),
          /* @__PURE__ */ t(x, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: "Service Info" })
        ] }),
        /* @__PURE__ */ i(m, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: [
          /* @__PURE__ */ i(m, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(x, { sx: { color: "var(--theme-text-secondary)" }, children: "Product" }),
            /* @__PURE__ */ t(x, { sx: { color: "var(--theme-text-primary)" }, children: e == null ? void 0 : e.product })
          ] }),
          /* @__PURE__ */ i(m, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(x, { sx: { color: "var(--theme-text-secondary)" }, children: "Version" }),
            /* @__PURE__ */ t(
              de,
              {
                label: (e == null ? void 0 : e.version) || "N/A",
                size: "small",
                sx: { bgcolor: "var(--theme-primary)20", color: "var(--theme-primary)" }
              }
            )
          ] }),
          /* @__PURE__ */ i(m, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(x, { sx: { color: "var(--theme-text-secondary)" }, children: "Timestamp" }),
            /* @__PURE__ */ t(x, { sx: { color: "var(--theme-text-primary)", fontSize: "0.875rem" }, children: e != null && e.timestamp ? new Date(e.timestamp).toLocaleString() : "N/A" })
          ] })
        ] })
      ] }) }) }),
      /* @__PURE__ */ t(Ae, { size: { xs: 12, md: 6 }, children: /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", height: "100%" }, children: /* @__PURE__ */ i(W, { children: [
        /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 3 }, children: [
          /* @__PURE__ */ t(cl, { sx: { color: "var(--theme-success)" } }),
          /* @__PURE__ */ t(x, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: "Uptime" })
        ] }),
        /* @__PURE__ */ t(x, { variant: "h3", sx: { color: "var(--theme-success)", mb: 1 }, children: hl((e == null ? void 0 : e.uptime) || 0) }),
        /* @__PURE__ */ t(x, { sx: { color: "var(--theme-text-secondary)" }, children: "Service has been running without interruption" })
      ] }) }) }),
      n && /* @__PURE__ */ t(Ae, { size: { xs: 12 }, children: /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ i(W, { children: [
        /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 3 }, children: [
          /* @__PURE__ */ t(dl, { sx: { color: Lt(n.status) } }),
          /* @__PURE__ */ t(x, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: "Health Checks" }),
          /* @__PURE__ */ t(
            de,
            {
              label: n.status,
              size: "small",
              sx: {
                bgcolor: Lt(n.status) + "20",
                color: Lt(n.status),
                textTransform: "capitalize",
                ml: "auto"
              }
            }
          )
        ] }),
        /* @__PURE__ */ t(nt, { children: /* @__PURE__ */ i(at, { size: "small", children: [
          /* @__PURE__ */ t(ot, { children: /* @__PURE__ */ i(xe, { children: [
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Check" }),
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Status" }),
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Latency" }),
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Last Checked" })
          ] }) }),
          /* @__PURE__ */ t(st, { children: Object.entries(n.checks).map(([w, b]) => /* @__PURE__ */ i(xe, { children: [
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
              ul(b.status),
              /* @__PURE__ */ t(x, { fontWeight: 500, children: w })
            ] }) }),
            /* @__PURE__ */ t(_, { sx: { borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(
              de,
              {
                label: b.status,
                size: "small",
                sx: {
                  bgcolor: Lt(b.status) + "20",
                  color: Lt(b.status),
                  textTransform: "capitalize"
                }
              }
            ) }),
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)" }, children: ml(b.latency) }),
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: new Date(b.lastChecked).toLocaleTimeString() })
          ] }, w)) })
        ] }) })
      ] }) }) }),
      /* @__PURE__ */ t(Ae, { size: { xs: 12 }, children: /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ i(W, { children: [
        /* @__PURE__ */ t(x, { variant: "h6", sx: { color: "var(--theme-text-primary)", mb: 2 }, children: "Raw Diagnostics JSON (for AI agents)" }),
        /* @__PURE__ */ t(
          m,
          {
            component: "pre",
            sx: {
              bgcolor: "var(--theme-background)",
              p: 2,
              borderRadius: 1,
              overflow: "auto",
              maxHeight: 300,
              color: "var(--theme-text-primary)",
              fontFamily: "monospace",
              fontSize: "0.75rem"
            },
            children: JSON.stringify(e, null, 2)
          }
        )
      ] }) }) })
    ] }),
    /* @__PURE__ */ t(
      Mn,
      {
        open: h.open,
        autoHideDuration: 2e3,
        onClose: () => u({ ...h, open: !1 }),
        anchorOrigin: { vertical: "bottom", horizontal: "center" },
        children: /* @__PURE__ */ t(Y, { severity: "success", variant: "filled", children: h.message })
      }
    )
  ] });
}
const Mr = te(/* @__PURE__ */ t("path", {
  d: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z"
}), "Edit"), pl = te(/* @__PURE__ */ t("path", {
  d: "M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3m3-10H5V5h10z"
}), "Save"), gl = te(/* @__PURE__ */ t("path", {
  d: "M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2m5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12z"
}), "Cancel"), yl = te(/* @__PURE__ */ t("path", {
  d: "m12 8-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"
}), "ExpandLess");
function kn(e) {
  switch (e) {
    case "enabled":
      return "var(--theme-success)";
    case "error":
      return "var(--theme-error)";
    case "disabled":
    default:
      return "var(--theme-text-secondary)";
  }
}
function bl(e) {
  switch (e) {
    case "enabled":
      return /* @__PURE__ */ t(Me, { sx: { color: "var(--theme-success)" } });
    case "error":
      return /* @__PURE__ */ t(Ne, { sx: { color: "var(--theme-error)" } });
    case "disabled":
    default:
      return /* @__PURE__ */ t(Ur, { sx: { color: "var(--theme-text-secondary)" } });
  }
}
const En = {
  domain: "",
  clientId: "",
  clientSecret: "",
  baseUrl: "",
  secret: "",
  audience: "",
  scopes: ["openid", "profile", "email"],
  allowedRoles: [],
  allowedDomains: []
}, In = {
  url: "",
  anonKey: ""
}, $n = {
  username: "",
  password: "",
  realm: "Protected Area"
}, An = {
  connectionUri: "",
  apiKey: "",
  appName: "",
  apiDomain: "",
  websiteDomain: "",
  apiBasePath: "/auth",
  websiteBasePath: "/auth",
  enableEmailPassword: !0,
  socialProviders: {}
};
function vl() {
  var et, Re, Ee;
  const [e, r] = f(null), [n, a] = f(!0), [o, s] = f(null), [l, c] = f(null), [h, u] = f(!1), [p, g] = f(!1), [v, w] = f(!1), [b, A] = f(null), [$, N] = f(""), [O, E] = f(En), [y, P] = f(In), [D, V] = f($n), [j, B] = f(An), [ce, R] = f(!0), [d, z] = f(""), [C, M] = f({
    enabled: !1,
    clientId: "",
    clientSecret: ""
  }), [U, he] = f({
    enabled: !1,
    clientId: "",
    clientSecret: ""
  }), [G, be] = f({
    enabled: !1,
    clientId: "",
    clientSecret: "",
    keyId: "",
    teamId: ""
  }), [L, q] = f(!1), [J, Z] = f(!1), T = Se(async () => {
    var I, X, Le, Tt;
    a(!0), s(null);
    try {
      const we = await Q.getAuthConfig();
      if (r(we), we.runtimeConfig) {
        const Ie = we.runtimeConfig;
        if (N(Ie.adapter || ""), R(Ie.settings.authRequired ?? !0), z(((I = Ie.settings.excludePaths) == null ? void 0 : I.join(", ")) || ""), Ie.config.auth0 && E({ ...En, ...Ie.config.auth0 }), Ie.config.supabase && P({ ...In, ...Ie.config.supabase }), Ie.config.basic && V({ ...$n, ...Ie.config.basic }), Ie.config.supertokens) {
          const ke = Ie.config.supertokens;
          B({ ...An, ...ke }), (X = ke.socialProviders) != null && X.google && M({
            enabled: !0,
            clientId: ke.socialProviders.google.clientId,
            clientSecret: ke.socialProviders.google.clientSecret
          }), (Le = ke.socialProviders) != null && Le.github && he({
            enabled: !0,
            clientId: ke.socialProviders.github.clientId,
            clientSecret: ke.socialProviders.github.clientSecret
          }), (Tt = ke.socialProviders) != null && Tt.apple && be({
            enabled: !0,
            clientId: ke.socialProviders.apple.clientId,
            clientSecret: ke.socialProviders.apple.clientSecret,
            keyId: ke.socialProviders.apple.keyId,
            teamId: ke.socialProviders.apple.teamId
          });
        }
      } else we.adapter && N(we.adapter);
    } catch (we) {
      s(we instanceof Error ? we.message : "Failed to fetch auth status");
    } finally {
      a(!1);
    }
  }, []);
  oe(() => {
    T();
  }, [T]);
  const ye = (I, X) => {
    navigator.clipboard.writeText(X), c(I), setTimeout(() => c(null), 2e3);
  }, Ce = () => {
    u(!0), A(null);
  }, re = () => {
    u(!1), A(null), T();
  }, ve = (I) => JSON.parse(JSON.stringify(I)), ze = () => {
    switch ($) {
      case "auth0":
        return ve(O);
      case "supabase":
        return ve(y);
      case "basic":
        return ve(D);
      case "supertokens": {
        const I = { ...j }, X = {};
        return C.enabled && (X.google = {
          clientId: C.clientId,
          clientSecret: C.clientSecret
        }), U.enabled && (X.github = {
          clientId: U.clientId,
          clientSecret: U.clientSecret
        }), G.enabled && (X.apple = {
          clientId: G.clientId,
          clientSecret: G.clientSecret,
          keyId: G.keyId || "",
          teamId: G.teamId || ""
        }), Object.keys(X).length > 0 && (I.socialProviders = X), ve(I);
      }
      default:
        return {};
    }
  }, Xe = async () => {
    if ($) {
      w(!0), A(null);
      try {
        const I = await Q.testAuthProvider({
          adapter: $,
          config: ze()
        });
        A(I);
      } catch (I) {
        A({
          success: !1,
          message: I instanceof Error ? I.message : "Test failed"
        });
      } finally {
        w(!1);
      }
    }
  }, ft = async () => {
    if (e != null && e.adapter) {
      w(!0), A(null);
      try {
        const I = await Q.testCurrentAuthProvider();
        A(I);
      } catch (I) {
        A({
          success: !1,
          message: I instanceof Error ? I.message : "Test failed"
        });
      } finally {
        w(!1);
      }
    }
  }, Fe = async () => {
    if ($) {
      g(!0), s(null);
      try {
        const I = {
          adapter: $,
          config: ze(),
          settings: {
            authRequired: ce,
            excludePaths: d.split(",").map((X) => X.trim()).filter(Boolean)
          }
        };
        await Q.updateAuthConfig(I), u(!1), await T();
      } catch (I) {
        s(I instanceof Error ? I.message : "Failed to save configuration");
      } finally {
        g(!1);
      }
    }
  }, Ke = async () => {
    g(!0), s(null);
    try {
      await Q.deleteAuthConfig(), Z(!1), u(!1), await T();
    } catch (I) {
      s(I instanceof Error ? I.message : "Failed to delete configuration");
    } finally {
      g(!1);
    }
  };
  if (n)
    return /* @__PURE__ */ t(m, { sx: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }, children: /* @__PURE__ */ t(le, {}) });
  const Ze = e != null && e.config ? Object.entries(e.config) : [];
  return /* @__PURE__ */ i(m, { children: [
    /* @__PURE__ */ i(m, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }, children: [
      /* @__PURE__ */ t(x, { variant: "h4", sx: { color: "var(--theme-text-primary)" }, children: "Authentication" }),
      /* @__PURE__ */ t(m, { sx: { display: "flex", gap: 1 }, children: !h && /* @__PURE__ */ i(je, { children: [
        /* @__PURE__ */ t(Pe, { title: "Edit Configuration", children: /* @__PURE__ */ t(Be, { onClick: Ce, sx: { color: "var(--theme-primary)" }, children: /* @__PURE__ */ t(Mr, {}) }) }),
        /* @__PURE__ */ t(Pe, { title: "Refresh", children: /* @__PURE__ */ t(Be, { onClick: T, sx: { color: "var(--theme-text-secondary)" }, children: /* @__PURE__ */ t(mt, {}) }) })
      ] }) })
    ] }),
    /* @__PURE__ */ t(x, { variant: "body2", sx: { mb: 4, color: "var(--theme-text-secondary)" }, children: h ? "Configure authentication provider" : "Auth plugin configuration status" }),
    o && /* @__PURE__ */ t(Y, { severity: "error", sx: { mb: 2 }, onClose: () => s(null), children: o }),
    h ? /* @__PURE__ */ i(m, { children: [
      /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", mb: 3 }, children: /* @__PURE__ */ i(W, { children: [
        /* @__PURE__ */ t(x, { variant: "h6", sx: { color: "var(--theme-text-primary)", mb: 2 }, children: "Provider Selection" }),
        /* @__PURE__ */ i(tr, { fullWidth: !0, sx: { mb: 2 }, children: [
          /* @__PURE__ */ t(rr, { sx: { color: "var(--theme-text-secondary)" }, children: "Auth Provider" }),
          /* @__PURE__ */ i(
            nr,
            {
              value: $,
              onChange: (I) => N(I.target.value),
              label: "Auth Provider",
              sx: { color: "var(--theme-text-primary)" },
              children: [
                /* @__PURE__ */ t($e, { value: "", children: /* @__PURE__ */ t("em", { children: "None (Disabled)" }) }),
                /* @__PURE__ */ t($e, { value: "supertokens", children: "SuperTokens" }),
                /* @__PURE__ */ t($e, { value: "auth0", children: "Auth0" }),
                /* @__PURE__ */ t($e, { value: "supabase", children: "Supabase" }),
                /* @__PURE__ */ t($e, { value: "basic", children: "Basic Auth" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ i(m, { sx: { display: "flex", gap: 2, alignItems: "center" }, children: [
          /* @__PURE__ */ t(
            _t,
            {
              control: /* @__PURE__ */ t(
                Mt,
                {
                  checked: ce,
                  onChange: (I) => R(I.target.checked),
                  sx: { "& .MuiSwitch-switchBase.Mui-checked": { color: "var(--theme-primary)" } }
                }
              ),
              label: "Auth Required",
              sx: { color: "var(--theme-text-primary)" }
            }
          ),
          /* @__PURE__ */ t(
            K,
            {
              label: "Exclude Paths (comma-separated)",
              value: d,
              onChange: (I) => z(I.target.value),
              size: "small",
              sx: { flex: 1, "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } },
              placeholder: "/api/health, /api/public/*"
            }
          )
        ] })
      ] }) }),
      $ === "auth0" && /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", mb: 3 }, children: /* @__PURE__ */ i(W, { children: [
        /* @__PURE__ */ t(x, { variant: "h6", sx: { color: "var(--theme-text-primary)", mb: 2 }, children: "Auth0 Configuration" }),
        /* @__PURE__ */ i(m, { sx: { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }, children: [
          /* @__PURE__ */ t(
            K,
            {
              label: "Domain",
              value: O.domain,
              onChange: (I) => E({ ...O, domain: I.target.value }),
              required: !0,
              placeholder: "your-tenant.auth0.com",
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          ),
          /* @__PURE__ */ t(
            K,
            {
              label: "Client ID",
              value: O.clientId,
              onChange: (I) => E({ ...O, clientId: I.target.value }),
              required: !0,
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          ),
          /* @__PURE__ */ t(
            K,
            {
              label: "Client Secret",
              type: "password",
              value: O.clientSecret,
              onChange: (I) => E({ ...O, clientSecret: I.target.value }),
              required: !0,
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          ),
          /* @__PURE__ */ t(
            K,
            {
              label: "Base URL",
              value: O.baseUrl,
              onChange: (I) => E({ ...O, baseUrl: I.target.value }),
              required: !0,
              placeholder: "https://your-app.com",
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          ),
          /* @__PURE__ */ t(
            K,
            {
              label: "Session Secret",
              type: "password",
              value: O.secret,
              onChange: (I) => E({ ...O, secret: I.target.value }),
              required: !0,
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          ),
          /* @__PURE__ */ t(
            K,
            {
              label: "API Audience (optional)",
              value: O.audience || "",
              onChange: (I) => E({ ...O, audience: I.target.value }),
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          )
        ] })
      ] }) }),
      $ === "supabase" && /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", mb: 3 }, children: /* @__PURE__ */ i(W, { children: [
        /* @__PURE__ */ t(x, { variant: "h6", sx: { color: "var(--theme-text-primary)", mb: 2 }, children: "Supabase Configuration" }),
        /* @__PURE__ */ i(m, { sx: { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }, children: [
          /* @__PURE__ */ t(
            K,
            {
              label: "Project URL",
              value: y.url,
              onChange: (I) => P({ ...y, url: I.target.value }),
              required: !0,
              placeholder: "https://your-project.supabase.co",
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          ),
          /* @__PURE__ */ t(
            K,
            {
              label: "Anon Key",
              type: "password",
              value: y.anonKey,
              onChange: (I) => P({ ...y, anonKey: I.target.value }),
              required: !0,
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          )
        ] })
      ] }) }),
      $ === "basic" && /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", mb: 3 }, children: /* @__PURE__ */ i(W, { children: [
        /* @__PURE__ */ t(x, { variant: "h6", sx: { color: "var(--theme-text-primary)", mb: 2 }, children: "Basic Auth Configuration" }),
        /* @__PURE__ */ i(m, { sx: { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2 }, children: [
          /* @__PURE__ */ t(
            K,
            {
              label: "Username",
              value: D.username,
              onChange: (I) => V({ ...D, username: I.target.value }),
              required: !0,
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          ),
          /* @__PURE__ */ t(
            K,
            {
              label: "Password",
              type: "password",
              value: D.password,
              onChange: (I) => V({ ...D, password: I.target.value }),
              required: !0,
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          ),
          /* @__PURE__ */ t(
            K,
            {
              label: "Realm (optional)",
              value: D.realm || "",
              onChange: (I) => V({ ...D, realm: I.target.value }),
              placeholder: "Protected Area",
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          )
        ] })
      ] }) }),
      $ === "supertokens" && /* @__PURE__ */ i(je, { children: [
        /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", mb: 3 }, children: /* @__PURE__ */ i(W, { children: [
          /* @__PURE__ */ t(x, { variant: "h6", sx: { color: "var(--theme-text-primary)", mb: 2 }, children: "SuperTokens Configuration" }),
          /* @__PURE__ */ i(m, { sx: { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }, children: [
            /* @__PURE__ */ t(
              K,
              {
                label: "Connection URI",
                value: j.connectionUri,
                onChange: (I) => B({ ...j, connectionUri: I.target.value }),
                required: !0,
                placeholder: "http://localhost:3567",
                sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
              }
            ),
            /* @__PURE__ */ t(
              K,
              {
                label: "API Key (optional)",
                type: "password",
                value: j.apiKey || "",
                onChange: (I) => B({ ...j, apiKey: I.target.value }),
                sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
              }
            ),
            /* @__PURE__ */ t(
              K,
              {
                label: "App Name",
                value: j.appName,
                onChange: (I) => B({ ...j, appName: I.target.value }),
                required: !0,
                sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
              }
            ),
            /* @__PURE__ */ t(
              K,
              {
                label: "API Domain",
                value: j.apiDomain,
                onChange: (I) => B({ ...j, apiDomain: I.target.value }),
                required: !0,
                placeholder: "http://localhost:3000",
                sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
              }
            ),
            /* @__PURE__ */ t(
              K,
              {
                label: "Website Domain",
                value: j.websiteDomain,
                onChange: (I) => B({ ...j, websiteDomain: I.target.value }),
                required: !0,
                placeholder: "http://localhost:3000",
                sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
              }
            ),
            /* @__PURE__ */ t(
              K,
              {
                label: "API Base Path",
                value: j.apiBasePath || "/auth",
                onChange: (I) => B({ ...j, apiBasePath: I.target.value }),
                sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
              }
            )
          ] }),
          /* @__PURE__ */ t(m, { sx: { mt: 2 }, children: /* @__PURE__ */ t(
            _t,
            {
              control: /* @__PURE__ */ t(
                Mt,
                {
                  checked: j.enableEmailPassword ?? !0,
                  onChange: (I) => B({ ...j, enableEmailPassword: I.target.checked }),
                  sx: { "& .MuiSwitch-switchBase.Mui-checked": { color: "var(--theme-primary)" } }
                }
              ),
              label: "Enable Email/Password Auth",
              sx: { color: "var(--theme-text-primary)" }
            }
          ) })
        ] }) }),
        /* @__PURE__ */ i(F, { sx: { bgcolor: "var(--theme-surface)", mb: 3 }, children: [
          /* @__PURE__ */ t(W, { sx: { pb: L ? 2 : 0 }, children: /* @__PURE__ */ i(
            m,
            {
              sx: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer"
              },
              onClick: () => q(!L),
              children: [
                /* @__PURE__ */ t(x, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: "Social Login Providers" }),
                L ? /* @__PURE__ */ t(yl, {}) : /* @__PURE__ */ t(ca, {})
              ]
            }
          ) }),
          /* @__PURE__ */ t(Oa, { in: L, children: /* @__PURE__ */ i(W, { sx: { pt: 0 }, children: [
            /* @__PURE__ */ t(zn, { sx: { mb: 2 } }),
            /* @__PURE__ */ i(m, { sx: { mb: 3 }, children: [
              /* @__PURE__ */ t(
                _t,
                {
                  control: /* @__PURE__ */ t(
                    Mt,
                    {
                      checked: C.enabled,
                      onChange: (I) => M({ ...C, enabled: I.target.checked }),
                      sx: { "& .MuiSwitch-switchBase.Mui-checked": { color: "var(--theme-primary)" } }
                    }
                  ),
                  label: "Google",
                  sx: { color: "var(--theme-text-primary)", mb: 1 }
                }
              ),
              C.enabled && /* @__PURE__ */ i(m, { sx: { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, ml: 4 }, children: [
                /* @__PURE__ */ t(
                  K,
                  {
                    label: "Client ID",
                    size: "small",
                    value: C.clientId,
                    onChange: (I) => M({ ...C, clientId: I.target.value }),
                    sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
                  }
                ),
                /* @__PURE__ */ t(
                  K,
                  {
                    label: "Client Secret",
                    size: "small",
                    type: "password",
                    value: C.clientSecret,
                    onChange: (I) => M({ ...C, clientSecret: I.target.value }),
                    sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ i(m, { sx: { mb: 3 }, children: [
              /* @__PURE__ */ t(
                _t,
                {
                  control: /* @__PURE__ */ t(
                    Mt,
                    {
                      checked: U.enabled,
                      onChange: (I) => he({ ...U, enabled: I.target.checked }),
                      sx: { "& .MuiSwitch-switchBase.Mui-checked": { color: "var(--theme-primary)" } }
                    }
                  ),
                  label: "GitHub",
                  sx: { color: "var(--theme-text-primary)", mb: 1 }
                }
              ),
              U.enabled && /* @__PURE__ */ i(m, { sx: { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, ml: 4 }, children: [
                /* @__PURE__ */ t(
                  K,
                  {
                    label: "Client ID",
                    size: "small",
                    value: U.clientId,
                    onChange: (I) => he({ ...U, clientId: I.target.value }),
                    sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
                  }
                ),
                /* @__PURE__ */ t(
                  K,
                  {
                    label: "Client Secret",
                    size: "small",
                    type: "password",
                    value: U.clientSecret,
                    onChange: (I) => he({ ...U, clientSecret: I.target.value }),
                    sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ i(m, { children: [
              /* @__PURE__ */ t(
                _t,
                {
                  control: /* @__PURE__ */ t(
                    Mt,
                    {
                      checked: G.enabled,
                      onChange: (I) => be({ ...G, enabled: I.target.checked }),
                      sx: { "& .MuiSwitch-switchBase.Mui-checked": { color: "var(--theme-primary)" } }
                    }
                  ),
                  label: "Apple",
                  sx: { color: "var(--theme-text-primary)", mb: 1 }
                }
              ),
              G.enabled && /* @__PURE__ */ i(m, { sx: { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, ml: 4 }, children: [
                /* @__PURE__ */ t(
                  K,
                  {
                    label: "Client ID",
                    size: "small",
                    value: G.clientId,
                    onChange: (I) => be({ ...G, clientId: I.target.value }),
                    sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
                  }
                ),
                /* @__PURE__ */ t(
                  K,
                  {
                    label: "Client Secret",
                    size: "small",
                    type: "password",
                    value: G.clientSecret,
                    onChange: (I) => be({ ...G, clientSecret: I.target.value }),
                    sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
                  }
                ),
                /* @__PURE__ */ t(
                  K,
                  {
                    label: "Key ID",
                    size: "small",
                    value: G.keyId || "",
                    onChange: (I) => be({ ...G, keyId: I.target.value }),
                    sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
                  }
                ),
                /* @__PURE__ */ t(
                  K,
                  {
                    label: "Team ID",
                    size: "small",
                    value: G.teamId || "",
                    onChange: (I) => be({ ...G, teamId: I.target.value }),
                    sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
                  }
                )
              ] })
            ] })
          ] }) })
        ] })
      ] }),
      b && /* @__PURE__ */ i(Y, { severity: b.success ? "success" : "error", sx: { mb: 3 }, children: [
        /* @__PURE__ */ t(x, { variant: "body2", sx: { fontWeight: 600 }, children: b.success ? "Connection Successful" : "Connection Failed" }),
        /* @__PURE__ */ t(x, { variant: "body2", children: b.message }),
        ((et = b.details) == null ? void 0 : et.latency) && /* @__PURE__ */ i(x, { variant: "caption", sx: { display: "block", mt: 0.5 }, children: [
          "Latency: ",
          b.details.latency,
          "ms"
        ] })
      ] }),
      /* @__PURE__ */ i(m, { sx: { display: "flex", gap: 2, justifyContent: "space-between" }, children: [
        /* @__PURE__ */ i(m, { sx: { display: "flex", gap: 2 }, children: [
          /* @__PURE__ */ t(
            ae,
            {
              variant: "outlined",
              startIcon: /* @__PURE__ */ t(gl, {}),
              onClick: re,
              disabled: p,
              sx: {
                color: "var(--theme-text-secondary)",
                borderColor: "var(--theme-border)"
              },
              children: "Cancel"
            }
          ),
          (e == null ? void 0 : e.runtimeConfig) && /* @__PURE__ */ t(
            ae,
            {
              variant: "outlined",
              color: "error",
              startIcon: /* @__PURE__ */ t(Qt, {}),
              onClick: () => Z(!0),
              disabled: p,
              children: "Reset to Env Vars"
            }
          )
        ] }),
        /* @__PURE__ */ i(m, { sx: { display: "flex", gap: 2 }, children: [
          /* @__PURE__ */ t(
            ae,
            {
              variant: "outlined",
              startIcon: v ? /* @__PURE__ */ t(le, { size: 16 }) : /* @__PURE__ */ t(At, {}),
              onClick: Xe,
              disabled: !$ || v || p,
              sx: {
                color: "var(--theme-text-primary)",
                borderColor: "var(--theme-border)"
              },
              children: "Test Connection"
            }
          ),
          /* @__PURE__ */ t(
            ae,
            {
              variant: "contained",
              startIcon: p ? /* @__PURE__ */ t(le, { size: 16, sx: { color: "white" } }) : /* @__PURE__ */ t(pl, {}),
              onClick: Fe,
              disabled: p,
              sx: {
                bgcolor: "var(--theme-primary)",
                "&:hover": { bgcolor: "var(--theme-primary-dark)" }
              },
              children: "Save Configuration"
            }
          )
        ] })
      ] })
    ] }) : /* @__PURE__ */ i(je, { children: [
      /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", mb: 3 }, children: /* @__PURE__ */ i(W, { children: [
        /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", gap: 2, mb: 2 }, children: [
          bl((e == null ? void 0 : e.state) || "disabled"),
          /* @__PURE__ */ i(m, { sx: { flex: 1 }, children: [
            /* @__PURE__ */ i(x, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: [
              "Status:",
              " ",
              /* @__PURE__ */ t(
                de,
                {
                  label: ((Re = e == null ? void 0 : e.state) == null ? void 0 : Re.toUpperCase()) || "UNKNOWN",
                  size: "small",
                  sx: {
                    bgcolor: `${kn((e == null ? void 0 : e.state) || "disabled")}20`,
                    color: kn((e == null ? void 0 : e.state) || "disabled"),
                    fontWeight: 600
                  }
                }
              )
            ] }),
            (e == null ? void 0 : e.adapter) && /* @__PURE__ */ i(x, { variant: "body2", sx: { color: "var(--theme-text-secondary)", mt: 0.5 }, children: [
              "Adapter: ",
              /* @__PURE__ */ t("strong", { children: e.adapter })
            ] })
          ] }),
          (e == null ? void 0 : e.state) === "enabled" && (e == null ? void 0 : e.adapter) && /* @__PURE__ */ t(
            ae,
            {
              variant: "outlined",
              size: "small",
              startIcon: v ? /* @__PURE__ */ t(le, { size: 14 }) : /* @__PURE__ */ t(At, {}),
              onClick: ft,
              disabled: v,
              sx: {
                color: "var(--theme-text-primary)",
                borderColor: "var(--theme-border)"
              },
              children: "Test Connection"
            }
          )
        ] }),
        b && !h && /* @__PURE__ */ i(Y, { severity: b.success ? "success" : "error", sx: { mb: 2 }, children: [
          /* @__PURE__ */ t(x, { variant: "body2", sx: { fontWeight: 600 }, children: b.success ? "Connection Successful" : "Connection Failed" }),
          /* @__PURE__ */ t(x, { variant: "body2", children: b.message }),
          ((Ee = b.details) == null ? void 0 : Ee.latency) && /* @__PURE__ */ i(x, { variant: "caption", sx: { display: "block", mt: 0.5 }, children: [
            "Latency: ",
            b.details.latency,
            "ms"
          ] })
        ] }),
        (e == null ? void 0 : e.state) === "enabled" && !(e != null && e.runtimeConfig) && /* @__PURE__ */ i(Y, { severity: "success", sx: { mb: 2 }, children: [
          /* @__PURE__ */ t(x, { variant: "body2", sx: { fontWeight: 600 }, children: "Configured via Environment Variables" }),
          /* @__PURE__ */ t(x, { variant: "body2", children: 'Authentication is configured using environment variables. Click "Edit" to override with runtime configuration (requires PostgreSQL).' })
        ] }),
        (e == null ? void 0 : e.runtimeConfig) && /* @__PURE__ */ t(
          de,
          {
            label: "Runtime Configuration Active",
            size: "small",
            sx: {
              bgcolor: "var(--theme-primary)",
              color: "white",
              mb: 2
            }
          }
        ),
        (e == null ? void 0 : e.state) === "error" && e.error && /* @__PURE__ */ t(Y, { severity: "error", sx: { mb: 2 }, children: e.error }),
        (e == null ? void 0 : e.missingVars) && e.missingVars.length > 0 && /* @__PURE__ */ i(Y, { severity: "warning", sx: { mb: 2 }, children: [
          /* @__PURE__ */ t(x, { variant: "body2", sx: { fontWeight: 600, mb: 1 }, children: "Missing environment variables:" }),
          /* @__PURE__ */ t(m, { component: "ul", sx: { m: 0, pl: 2 }, children: e.missingVars.map((I) => /* @__PURE__ */ t("li", { children: /* @__PURE__ */ t("code", { children: I }) }, I)) })
        ] }),
        (e == null ? void 0 : e.state) === "disabled" && /* @__PURE__ */ i(Y, { severity: "info", children: [
          /* @__PURE__ */ i(x, { variant: "body2", children: [
            "Authentication is disabled. Click the edit button to configure a provider, or set the",
            " ",
            /* @__PURE__ */ t("code", { children: "AUTH_ADAPTER" }),
            " environment variable."
          ] }),
          /* @__PURE__ */ i(x, { variant: "body2", sx: { mt: 1 }, children: [
            "Valid options: ",
            /* @__PURE__ */ t("code", { children: "supertokens" }),
            ", ",
            /* @__PURE__ */ t("code", { children: "auth0" }),
            ", ",
            /* @__PURE__ */ t("code", { children: "supabase" }),
            ",",
            " ",
            /* @__PURE__ */ t("code", { children: "basic" })
          ] })
        ] })
      ] }) }),
      Ze.length > 0 && /* @__PURE__ */ i(F, { sx: { bgcolor: "var(--theme-surface)" }, children: [
        /* @__PURE__ */ t(W, { sx: { pb: 0 }, children: /* @__PURE__ */ t(x, { variant: "h6", sx: { color: "var(--theme-text-primary)", mb: 2 }, children: "Current Configuration" }) }),
        /* @__PURE__ */ t(nt, { children: /* @__PURE__ */ i(at, { size: "small", children: [
          /* @__PURE__ */ t(ot, { children: /* @__PURE__ */ i(xe, { children: [
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Variable" }),
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Value" }),
            /* @__PURE__ */ t(
              _,
              {
                sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", width: 60 },
                children: "Actions"
              }
            )
          ] }) }),
          /* @__PURE__ */ t(st, { children: Ze.map(([I, X]) => /* @__PURE__ */ i(xe, { children: [
            /* @__PURE__ */ t(_, { sx: { borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(
              x,
              {
                sx: { color: "var(--theme-text-primary)", fontFamily: "monospace", fontSize: 13 },
                children: I
              }
            ) }),
            /* @__PURE__ */ t(_, { sx: { borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(
              x,
              {
                sx: {
                  color: X.includes("*") ? "var(--theme-text-secondary)" : "var(--theme-text-primary)",
                  fontFamily: "monospace",
                  fontSize: 13
                },
                children: X
              }
            ) }),
            /* @__PURE__ */ t(_, { sx: { borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(Pe, { title: l === I ? "Copied!" : "Copy value", children: /* @__PURE__ */ t(
              Be,
              {
                size: "small",
                onClick: () => ye(I, X),
                sx: { color: l === I ? "var(--theme-success)" : "var(--theme-text-secondary)" },
                children: /* @__PURE__ */ t(Hr, { fontSize: "small" })
              }
            ) }) })
          ] }, I)) })
        ] }) })
      ] }),
      (e == null ? void 0 : e.state) === "enabled" && Ze.length === 0 && /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ t(x, { sx: { color: "var(--theme-text-secondary)", textAlign: "center" }, children: "No configuration details available" }) }) })
    ] }),
    /* @__PURE__ */ i(lt, { open: J, onClose: () => Z(!1), children: [
      /* @__PURE__ */ t(ct, { children: "Reset to Environment Variables?" }),
      /* @__PURE__ */ t(dt, { children: /* @__PURE__ */ t(x, { children: "This will delete the runtime configuration from the database. The auth plugin will fall back to environment variables on the next request." }) }),
      /* @__PURE__ */ i(ht, { children: [
        /* @__PURE__ */ t(ae, { onClick: () => Z(!1), children: "Cancel" }),
        /* @__PURE__ */ t(ae, { onClick: Ke, color: "error", disabled: p, children: p ? /* @__PURE__ */ t(le, { size: 20 }) : "Reset" })
      ] })
    ] })
  ] });
}
const xl = te(/* @__PURE__ */ t("path", {
  d: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
}), "Home");
function Cl() {
  const e = Nn();
  return /* @__PURE__ */ i(
    m,
    {
      sx: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        textAlign: "center"
      },
      children: [
        /* @__PURE__ */ t(x, { variant: "h1", sx: { color: "var(--theme-primary)", mb: 2 }, children: "404" }),
        /* @__PURE__ */ t(x, { variant: "h5", sx: { color: "var(--theme-text-primary)", mb: 1 }, children: "Page Not Found" }),
        /* @__PURE__ */ t(x, { sx: { color: "var(--theme-text-secondary)", mb: 4 }, children: "The page you're looking for doesn't exist or has been moved." }),
        /* @__PURE__ */ t(
          ae,
          {
            variant: "contained",
            startIcon: /* @__PURE__ */ t(xl, {}),
            onClick: () => e("/"),
            sx: {
              bgcolor: "var(--theme-primary)",
              "&:hover": { bgcolor: "var(--theme-primary)" }
            },
            children: "Back to Dashboard"
          }
        )
      ]
    }
  );
}
function wl({ version: e }) {
  return /* @__PURE__ */ t(m, { sx: { display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, py: 2 }, children: /* @__PURE__ */ i(H, { variant: "caption", customColor: "var(--theme-text-secondary)", children: [
    "Built with",
    " ",
    /* @__PURE__ */ t(
      Ba,
      {
        href: "https://qwickapps.com/products/qwickapps-server",
        target: "_blank",
        rel: "noopener noreferrer",
        sx: { color: "primary.main" },
        children: "QwickApps Server"
      }
    ),
    e && ` v${e}`
  ] }) });
}
function Sl() {
  return [
    { id: "dashboard", label: "Dashboard", route: "/", icon: "dashboard" },
    { id: "logs", label: "Logs", route: "/logs", icon: "article" },
    { id: "auth", label: "Auth", route: "/auth", icon: "lock" },
    { id: "system", label: "System", route: "/system", icon: "settings" }
  ];
}
function Bl({
  productName: e = "Control Panel",
  logo: r,
  footerContent: n,
  dashboardWidgets: a = [],
  widgetComponents: o = [],
  navigationItems: s = [],
  showBaseNavigation: l = !0,
  hideBaseNavItems: c = [],
  showThemeSwitcher: h = !0,
  showPaletteSwitcher: u = !0,
  basePath: p = "",
  // Keep for backwards compatibility but unused (API always at /api)
  children: g
}) {
  const [v, w] = f(""), b = [...Yi(), ...o], A = window.__APP_BASE_PATH__ || "";
  Q.setBaseUrl(A), oe(() => {
    Q.getInfo().then((y) => w(y.version || "")).catch(() => {
    });
  }, [A]);
  const N = [
    ...l ? Sl().filter((y) => !c.includes(y.id)) : [],
    ...s
  ];
  return /* @__PURE__ */ t(wi, { initialComponents: b, children: /* @__PURE__ */ t(xi, { initialWidgets: a, children: /* @__PURE__ */ t(
    ja,
    {
      config: Ka,
      logo: r || /* @__PURE__ */ t(Fa, { name: e }),
      footerContent: n || /* @__PURE__ */ t(wl, { version: v }),
      enableScaffolding: !0,
      navigationItems: N,
      showThemeSwitcher: h,
      showPaletteSwitcher: u,
      children: /* @__PURE__ */ i(ka, { children: [
        l && /* @__PURE__ */ i(je, { children: [
          !c.includes("dashboard") && /* @__PURE__ */ t(Bt, { path: "/", element: /* @__PURE__ */ t(Zi, {}) }),
          !c.includes("logs") && /* @__PURE__ */ t(Bt, { path: "/logs", element: /* @__PURE__ */ t(ol, {}) }),
          !c.includes("auth") && /* @__PURE__ */ t(Bt, { path: "/auth", element: /* @__PURE__ */ t(vl, {}) }),
          !c.includes("system") && /* @__PURE__ */ t(Bt, { path: "/system", element: /* @__PURE__ */ t(fl, {}) })
        ] }),
        g,
        /* @__PURE__ */ t(Bt, { path: "*", element: /* @__PURE__ */ t(Cl, {}) })
      ] })
    }
  ) }) });
}
const Vt = te(/* @__PURE__ */ t("path", {
  d: "m21.41 11.58-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.06-.59-1.42M5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7"
}), "LocalOffer");
function _l({
  title: e = "User Management",
  subtitle: r = "Manage users, bans, and entitlements",
  features: n,
  headerActions: a,
  onUserSelect: o
}) {
  const [s, l] = f({
    users: (n == null ? void 0 : n.users) ?? !0,
    bans: (n == null ? void 0 : n.bans) ?? !1,
    entitlements: (n == null ? void 0 : n.entitlements) ?? !1,
    entitlementsReadonly: (n == null ? void 0 : n.entitlementsReadonly) ?? !0
  }), [c, h] = f(!!n), [u, p] = f(0), [g, v] = f([]), [w, b] = f(0), [A, $] = f(0), [N, O] = f(25), [E, y] = f(""), [P, D] = f({}), [V, j] = f([]), [B, ce] = f(0), [R, d] = f([]), [z, C] = f(0), [M, U] = f(!0), [he, G] = f(null), [be, L] = f(null), [q, J] = f(!1), [Z, T] = f({
    email: "",
    reason: "",
    expiresAt: ""
  }), [ye, Ce] = f(!1), [re, ve] = f({
    email: "",
    name: "",
    role: "",
    expiresInDays: 7
  }), [ze, Xe] = f(null), [ft, Fe] = f(!1), [Ke, Ze] = f(""), [et, Re] = f(!1), [Ee, I] = f(!1), [X, Le] = f(null), [Tt, we] = f(null), [Ie, ke] = f([]), [Pt, Kr] = f(""), [da, Gr] = f(!1);
  oe(() => {
    n || Q.detectFeatures().then((k) => {
      l(k), h(!0);
    }).catch(() => {
      h(!0);
    });
  }, [n]), oe(() => {
    c && s.entitlements && !s.entitlementsReadonly && Q.getAvailableEntitlements().then(ke).catch(() => {
    });
  }, [c, s.entitlements, s.entitlementsReadonly]);
  const Dt = Se(async () => {
    var k;
    if (s.users) {
      U(!0);
      try {
        const ee = await Q.getUsers({
          limit: N,
          page: A,
          search: E || void 0
        });
        if (v(ee.users || []), b(ee.total), G(null), s.entitlements && ((k = ee.users) != null && k.length)) {
          const zt = {};
          await Promise.all(
            ee.users.map(async (Ot) => {
              try {
                const ba = await Q.getEntitlements(Ot.email);
                zt[Ot.email] = ba.entitlements.length;
              } catch {
                zt[Ot.email] = 0;
              }
            })
          ), D((Ot) => ({ ...Ot, ...zt }));
        }
      } catch (ee) {
        G(ee instanceof Error ? ee.message : "Failed to fetch users");
      } finally {
        U(!1);
      }
    }
  }, [s.users, s.entitlements, A, N, E]), pt = Se(async () => {
    if (s.bans) {
      U(!0);
      try {
        const k = await Q.getBans();
        j(k.bans || []), ce(k.total), G(null);
      } catch (k) {
        G(k instanceof Error ? k.message : "Failed to fetch bans");
      } finally {
        U(!1);
      }
    }
  }, [s.bans]), qr = Se(async () => {
    if (s.users) {
      U(!0);
      try {
        const k = await Q.getInvitations();
        d(k.users || []), C(k.total), G(null);
      } catch (k) {
        G(k instanceof Error ? k.message : "Failed to fetch invitations");
      } finally {
        U(!1);
      }
    }
  }, [s.users]);
  oe(() => {
    c && (u === 0 && s.users ? Dt() : u === 1 && s.bans ? pt() : u === 2 && s.users && qr());
  }, [u, c, s.users, s.bans, Dt, pt, qr]), oe(() => {
    c && s.bans && pt();
  }, [c, s.bans, pt]), oe(() => {
    if (!c) return;
    const k = setTimeout(() => {
      u === 0 && s.users && ($(0), Dt());
    }, 300);
    return () => clearTimeout(k);
  }, [E, u, c, s.users, Dt]);
  const ha = async () => {
    try {
      await Q.banUser(Z.email, Z.reason, Z.expiresAt || void 0), L("User banned successfully"), J(!1), T({ email: "", reason: "", expiresAt: "" }), pt();
    } catch (k) {
      G(k instanceof Error ? k.message : "Failed to ban user");
    }
  }, ua = async (k) => {
    if (confirm("Unban this user?"))
      try {
        await Q.unbanUser(k), L("User unbanned successfully"), pt();
      } catch {
        G("Failed to unban user");
      }
  }, ma = async () => {
    try {
      const k = await Q.inviteUser({
        email: re.email,
        name: re.name || void 0,
        role: re.role || void 0,
        expiresInDays: re.expiresInDays
      });
      Xe({ token: k.token, inviteLink: k.inviteLink }), L("User invitation created successfully"), Dt();
    } catch (k) {
      G(k instanceof Error ? k.message : "Failed to invite user");
    }
  }, fa = () => {
    ze && (navigator.clipboard.writeText(ze.inviteLink), L("Invite link copied to clipboard"));
  }, Jr = () => {
    Ce(!1), ve({ email: "", name: "", role: "", expiresInDays: 7 }), Xe(null);
  }, Qr = async () => {
    if (!Ke.trim()) {
      we("Please enter an email address");
      return;
    }
    Re(!0), we(null), Le(null);
    try {
      const k = await Q.getEntitlements(Ke);
      Le(k);
    } catch (k) {
      we(k instanceof Error ? k.message : "Failed to lookup entitlements");
    } finally {
      Re(!1);
    }
  }, pa = async () => {
    if (X) {
      I(!0);
      try {
        const k = await Q.refreshEntitlements(Ke);
        Le(k);
      } catch {
        we("Failed to refresh entitlements");
      } finally {
        I(!1);
      }
    }
  }, ga = async () => {
    if (!(!Pt || !X)) {
      Gr(!0);
      try {
        await Q.grantEntitlement(X.identifier, Pt), L(`Entitlement "${Pt}" granted`), Kr("");
        const k = await Q.refreshEntitlements(X.identifier);
        Le(k), D((ee) => ({
          ...ee,
          [X.identifier]: k.entitlements.length
        }));
      } catch (k) {
        G(k instanceof Error ? k.message : "Failed to grant entitlement");
      } finally {
        Gr(!1);
      }
    }
  }, ya = async (k) => {
    if (X && confirm(`Revoke "${k}" from ${X.identifier}?`))
      try {
        await Q.revokeEntitlement(X.identifier, k), L(`Entitlement "${k}" revoked`);
        const ee = await Q.refreshEntitlements(X.identifier);
        Le(ee), D((zt) => ({
          ...zt,
          [X.identifier]: ee.entitlements.length
        }));
      } catch (ee) {
        G(ee instanceof Error ? ee.message : "Failed to revoke entitlement");
      }
  }, Yr = (k) => {
    k && (Ze(k), Re(!0), we(null), Le(null), Q.getEntitlements(k).then(Le).catch((ee) => we(ee instanceof Error ? ee.message : "Failed to lookup entitlements")).finally(() => Re(!1))), Fe(!0);
  }, gt = (k) => k ? new Date(k).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }) : "Never", Cr = Ie.filter(
    (k) => !(X != null && X.entitlements.includes(k.name))
  ), Nt = [];
  return s.users && Nt.push({ label: "Users", count: w }), s.bans && Nt.push({ label: "Banned", count: B }), s.users && Nt.push({ label: "Invitations", count: z }), c ? /* @__PURE__ */ i(m, { children: [
    /* @__PURE__ */ i(m, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }, children: [
      /* @__PURE__ */ i(m, { children: [
        /* @__PURE__ */ t(H, { variant: "h4", content: e, customColor: "var(--theme-text-primary)" }),
        /* @__PURE__ */ t(H, { variant: "body2", content: r, customColor: "var(--theme-text-secondary)" })
      ] }),
      /* @__PURE__ */ i(m, { sx: { display: "flex", gap: 1 }, children: [
        a,
        s.users && /* @__PURE__ */ t(
          me,
          {
            variant: "primary",
            icon: "person_add",
            label: "Invite User",
            onClick: () => Ce(!0)
          }
        ),
        s.entitlements && /* @__PURE__ */ t(
          me,
          {
            variant: "outlined",
            icon: "person_search",
            label: "Lookup Entitlements",
            onClick: () => Yr()
          }
        ),
        s.bans && /* @__PURE__ */ t(
          me,
          {
            variant: "outlined",
            color: "error",
            icon: "block",
            label: "Ban User",
            onClick: () => J(!0)
          }
        )
      ] })
    ] }),
    M && /* @__PURE__ */ t(Gt, { sx: { mb: 2 } }),
    he && /* @__PURE__ */ t(Y, { severity: "error", onClose: () => G(null), sx: { mb: 2 }, children: he }),
    be && /* @__PURE__ */ t(Y, { severity: "success", onClose: () => L(null), sx: { mb: 2 }, children: be }),
    s.users && /* @__PURE__ */ i(ir, { columns: s.bans ? 3 : 2, spacing: "medium", sx: { mb: 3 }, equalHeight: !0, children: [
      /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        /* @__PURE__ */ t(la, { sx: { fontSize: 40, color: "var(--theme-primary)" } }),
        /* @__PURE__ */ i(m, { children: [
          /* @__PURE__ */ t(H, { variant: "h4", content: w.toLocaleString(), customColor: "var(--theme-text-primary)" }),
          /* @__PURE__ */ t(H, { variant: "body2", content: "Total Users", customColor: "var(--theme-text-secondary)" })
        ] })
      ] }) }) }),
      s.entitlements && /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        /* @__PURE__ */ t(Vt, { sx: { fontSize: 40, color: "var(--theme-success)" } }),
        /* @__PURE__ */ i(m, { children: [
          /* @__PURE__ */ t(H, { variant: "body1", fontWeight: "500", content: "Entitlements", customColor: "var(--theme-text-primary)" }),
          /* @__PURE__ */ t(
            H,
            {
              variant: "body2",
              content: s.entitlementsReadonly ? "Read-only Mode" : "Plugin Active",
              customColor: s.entitlementsReadonly ? "var(--theme-warning)" : "var(--theme-success)"
            }
          )
        ] })
      ] }) }) }),
      s.bans && /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        /* @__PURE__ */ t(Ur, { sx: { fontSize: 40, color: B > 0 ? "var(--theme-error)" : "var(--theme-text-secondary)" } }),
        /* @__PURE__ */ i(m, { children: [
          /* @__PURE__ */ t(H, { variant: "h4", content: B.toString(), customColor: B > 0 ? "var(--theme-error)" : "var(--theme-text-primary)" }),
          /* @__PURE__ */ t(H, { variant: "body2", content: "Banned Users", customColor: "var(--theme-text-secondary)" })
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ i(F, { sx: { bgcolor: "var(--theme-surface)" }, children: [
      Nt.length > 1 && /* @__PURE__ */ t(
        _a,
        {
          value: u,
          onChange: (k, ee) => p(ee),
          sx: { borderBottom: 1, borderColor: "var(--theme-border)", px: 2 },
          children: Nt.map((k, ee) => /* @__PURE__ */ t(Ma, { label: `${k.label}${k.count !== void 0 ? ` (${k.count})` : ""}` }, ee))
        }
      ),
      /* @__PURE__ */ i(W, { sx: { p: 0 }, children: [
        /* @__PURE__ */ t(m, { sx: { p: 2, borderBottom: 1, borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(
          K,
          {
            size: "small",
            placeholder: "Search by email or name...",
            value: E,
            onChange: (k) => y(k.target.value),
            InputProps: {
              startAdornment: /* @__PURE__ */ t(Zt, { position: "start", children: /* @__PURE__ */ t(Vr, { sx: { color: "var(--theme-text-secondary)" } }) })
            },
            sx: { minWidth: 300 }
          }
        ) }),
        u === 0 && s.users && /* @__PURE__ */ i(je, { children: [
          /* @__PURE__ */ t(nt, { children: /* @__PURE__ */ i(at, { children: [
            /* @__PURE__ */ t(ot, { children: /* @__PURE__ */ i(xe, { children: [
              /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "ID" }),
              /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Name" }),
              /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Email" }),
              s.entitlements && /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, align: "center", children: "Entitlements" }),
              /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Created" }),
              /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, align: "right", children: "Actions" })
            ] }) }),
            /* @__PURE__ */ i(st, { children: [
              g.map((k) => /* @__PURE__ */ i(
                xe,
                {
                  hover: !0,
                  sx: { cursor: o ? "pointer" : "default" },
                  onClick: () => o == null ? void 0 : o(k),
                  children: [
                    /* @__PURE__ */ i(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", fontFamily: "monospace", fontSize: "0.75rem" }, children: [
                      k.id.substring(0, 8),
                      "..."
                    ] }),
                    /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(H, { variant: "body1", content: k.name || "--", fontWeight: "500" }) }),
                    /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)" }, children: k.email }),
                    s.entitlements && /* @__PURE__ */ t(_, { sx: { borderColor: "var(--theme-border)" }, align: "center", children: /* @__PURE__ */ t(
                      de,
                      {
                        size: "small",
                        icon: /* @__PURE__ */ t(Vt, { sx: { fontSize: 14 } }),
                        label: P[k.email] ?? "...",
                        sx: {
                          bgcolor: "var(--theme-primary)20",
                          color: "var(--theme-primary)"
                        }
                      }
                    ) }),
                    /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: gt(k.created_at) }),
                    /* @__PURE__ */ t(_, { sx: { borderColor: "var(--theme-border)" }, align: "right", children: s.entitlements && /* @__PURE__ */ t(Pe, { title: "View entitlements", children: /* @__PURE__ */ t(Be, { size: "small", onClick: (ee) => {
                      ee.stopPropagation(), Yr(k.email);
                    }, children: /* @__PURE__ */ t(Vt, { fontSize: "small" }) }) }) })
                  ]
                },
                k.id
              )),
              g.length === 0 && !M && /* @__PURE__ */ t(xe, { children: /* @__PURE__ */ t(_, { colSpan: s.entitlements ? 6 : 5, align: "center", sx: { py: 4, color: "var(--theme-text-secondary)" }, children: E ? "No users match your search" : "No users found" }) })
            ] })
          ] }) }),
          /* @__PURE__ */ t(
            Ra,
            {
              component: "div",
              count: w,
              page: A,
              onPageChange: (k, ee) => $(ee),
              rowsPerPage: N,
              onRowsPerPageChange: (k) => {
                O(parseInt(k.target.value, 10)), $(0);
              },
              rowsPerPageOptions: [10, 25, 50, 100],
              sx: { borderTop: 1, borderColor: "var(--theme-border)" }
            }
          )
        ] }),
        u === 1 && s.bans && /* @__PURE__ */ t(nt, { children: /* @__PURE__ */ i(at, { children: [
          /* @__PURE__ */ t(ot, { children: /* @__PURE__ */ i(xe, { children: [
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Email" }),
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Reason" }),
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Banned At" }),
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Expires" }),
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Banned By" }),
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, align: "right", children: "Actions" })
          ] }) }),
          /* @__PURE__ */ i(st, { children: [
            V.map((k) => /* @__PURE__ */ i(xe, { children: [
              /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(H, { variant: "body1", content: k.email, fontWeight: "500" }) }),
              /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", maxWidth: 200 }, children: /* @__PURE__ */ t(H, { variant: "body2", content: k.reason, noWrap: !0 }) }),
              /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: gt(k.banned_at) }),
              /* @__PURE__ */ t(_, { sx: { borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(
                de,
                {
                  size: "small",
                  label: k.expires_at ? gt(k.expires_at) : "Permanent",
                  sx: {
                    bgcolor: k.expires_at ? "var(--theme-warning)20" : "var(--theme-error)20",
                    color: k.expires_at ? "var(--theme-warning)" : "var(--theme-error)"
                  }
                }
              ) }),
              /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: k.banned_by }),
              /* @__PURE__ */ t(_, { sx: { borderColor: "var(--theme-border)" }, align: "right", children: /* @__PURE__ */ t(
                me,
                {
                  buttonSize: "small",
                  variant: "text",
                  color: "success",
                  icon: "check_circle",
                  label: "Unban",
                  onClick: () => ua(k.email)
                }
              ) })
            ] }, k.id)),
            V.length === 0 && !M && /* @__PURE__ */ t(xe, { children: /* @__PURE__ */ t(_, { colSpan: 6, align: "center", sx: { py: 4, color: "var(--theme-text-secondary)" }, children: "No users are currently banned" }) })
          ] })
        ] }) }),
        u === 2 && s.users && /* @__PURE__ */ t(nt, { children: /* @__PURE__ */ i(at, { children: [
          /* @__PURE__ */ t(ot, { children: /* @__PURE__ */ i(xe, { children: [
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Email" }),
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Name" }),
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Created" }),
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Expires" }),
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Status" })
          ] }) }),
          /* @__PURE__ */ i(st, { children: [
            R.map((k) => {
              const ee = k.invitation_expires_at && new Date(k.invitation_expires_at) < /* @__PURE__ */ new Date();
              return /* @__PURE__ */ i(xe, { children: [
                /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(H, { variant: "body1", content: k.email, fontWeight: "500" }) }),
                /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)" }, children: k.name || "--" }),
                /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: gt(k.created_at) }),
                /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: gt(k.invitation_expires_at) }),
                /* @__PURE__ */ t(_, { sx: { borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(
                  de,
                  {
                    size: "small",
                    label: ee ? "Expired" : "Pending",
                    sx: {
                      bgcolor: ee ? "var(--theme-error)20" : "var(--theme-warning)20",
                      color: ee ? "var(--theme-error)" : "var(--theme-warning)"
                    }
                  }
                ) })
              ] }, k.id);
            }),
            R.length === 0 && !M && /* @__PURE__ */ t(xe, { children: /* @__PURE__ */ t(_, { colSpan: 5, align: "center", sx: { py: 4, color: "var(--theme-text-secondary)" }, children: "No pending invitations" }) })
          ] })
        ] }) })
      ] })
    ] }),
    s.users && /* @__PURE__ */ i(
      wt,
      {
        open: ye,
        onClose: Jr,
        maxWidth: "sm",
        fullWidth: !0,
        children: [
          /* @__PURE__ */ t(St, { children: "Invite User" }),
          /* @__PURE__ */ t(kt, { children: ze ? /* @__PURE__ */ i(m, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [
            /* @__PURE__ */ t(Y, { severity: "success", children: "Invitation created successfully! Share this link with the user:" }),
            /* @__PURE__ */ t(
              K,
              {
                label: "Invitation Link",
                fullWidth: !0,
                value: ze.inviteLink,
                InputProps: {
                  readOnly: !0,
                  endAdornment: /* @__PURE__ */ t(Zt, { position: "end", children: /* @__PURE__ */ t(Pe, { title: "Copy to clipboard", children: /* @__PURE__ */ t(Be, { onClick: fa, edge: "end", children: /* @__PURE__ */ t(Hr, {}) }) }) })
                },
                helperText: "Click the icon to copy the link to clipboard"
              }
            ),
            /* @__PURE__ */ t(Y, { severity: "info", children: "The user will need to visit this link to activate their account." })
          ] }) : /* @__PURE__ */ i(m, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [
            /* @__PURE__ */ t(
              K,
              {
                label: "Email",
                fullWidth: !0,
                required: !0,
                value: re.email,
                onChange: (k) => ve({ ...re, email: k.target.value }),
                placeholder: "user@example.com",
                type: "email"
              }
            ),
            /* @__PURE__ */ t(
              K,
              {
                label: "Name (Optional)",
                fullWidth: !0,
                value: re.name,
                onChange: (k) => ve({ ...re, name: k.target.value }),
                placeholder: "Enter user's full name"
              }
            ),
            /* @__PURE__ */ t(
              K,
              {
                label: "Role (Optional)",
                fullWidth: !0,
                value: re.role,
                onChange: (k) => ve({ ...re, role: k.target.value }),
                placeholder: "e.g., admin, editor, viewer",
                helperText: "Stored in user metadata for your app to use"
              }
            ),
            /* @__PURE__ */ t(
              K,
              {
                label: "Invitation Expiry",
                type: "number",
                fullWidth: !0,
                value: re.expiresInDays,
                onChange: (k) => ve({ ...re, expiresInDays: parseInt(k.target.value) || 7 }),
                InputProps: {
                  endAdornment: /* @__PURE__ */ t(Zt, { position: "end", children: "days" })
                },
                helperText: "How many days until the invitation expires"
              }
            )
          ] }) }),
          /* @__PURE__ */ i(Et, { children: [
            /* @__PURE__ */ t(
              me,
              {
                variant: "text",
                label: "Close",
                onClick: Jr
              }
            ),
            !ze && /* @__PURE__ */ t(
              me,
              {
                variant: "primary",
                label: "Create Invitation",
                onClick: ma,
                disabled: !re.email
              }
            )
          ] })
        ]
      }
    ),
    s.bans && /* @__PURE__ */ i(
      wt,
      {
        open: q,
        onClose: () => J(!1),
        maxWidth: "sm",
        fullWidth: !0,
        children: [
          /* @__PURE__ */ t(St, { children: "Ban User" }),
          /* @__PURE__ */ t(kt, { children: /* @__PURE__ */ i(m, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [
            /* @__PURE__ */ t(
              K,
              {
                label: "Email",
                fullWidth: !0,
                value: Z.email,
                onChange: (k) => T({ ...Z, email: k.target.value }),
                placeholder: "Enter user email"
              }
            ),
            /* @__PURE__ */ t(
              K,
              {
                label: "Reason",
                fullWidth: !0,
                multiline: !0,
                rows: 3,
                value: Z.reason,
                onChange: (k) => T({ ...Z, reason: k.target.value }),
                placeholder: "Enter reason for ban"
              }
            ),
            /* @__PURE__ */ t(
              K,
              {
                label: "Expiration (Optional)",
                type: "datetime-local",
                fullWidth: !0,
                value: Z.expiresAt,
                onChange: (k) => T({ ...Z, expiresAt: k.target.value }),
                InputLabelProps: { shrink: !0 },
                helperText: "Leave empty for permanent ban"
              }
            )
          ] }) }),
          /* @__PURE__ */ i(Et, { children: [
            /* @__PURE__ */ t(
              me,
              {
                variant: "text",
                label: "Cancel",
                onClick: () => {
                  J(!1), T({ email: "", reason: "", expiresAt: "" });
                }
              }
            ),
            /* @__PURE__ */ t(
              me,
              {
                variant: "primary",
                color: "error",
                label: "Ban User",
                onClick: ha,
                disabled: !Z.email || !Z.reason
              }
            )
          ] })
        ]
      }
    ),
    s.entitlements && /* @__PURE__ */ i(
      wt,
      {
        open: ft,
        onClose: () => Fe(!1),
        maxWidth: "md",
        fullWidth: !0,
        children: [
          /* @__PURE__ */ t(St, { children: "User Entitlements" }),
          /* @__PURE__ */ t(kt, { children: /* @__PURE__ */ i(m, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [
            /* @__PURE__ */ i(m, { sx: { display: "flex", gap: 1 }, children: [
              /* @__PURE__ */ t(
                K,
                {
                  label: "Email",
                  fullWidth: !0,
                  value: Ke,
                  onChange: (k) => Ze(k.target.value),
                  placeholder: "Enter user email",
                  onKeyDown: (k) => k.key === "Enter" && Qr()
                }
              ),
              /* @__PURE__ */ t(
                me,
                {
                  variant: "primary",
                  icon: "search",
                  label: "Lookup",
                  onClick: Qr,
                  disabled: et
                }
              )
            ] }),
            et && /* @__PURE__ */ t(m, { sx: { display: "flex", justifyContent: "center", py: 4 }, children: /* @__PURE__ */ t(le, {}) }),
            Tt && /* @__PURE__ */ t(Y, { severity: "error", children: Tt }),
            X && /* @__PURE__ */ i(m, { children: [
              /* @__PURE__ */ i(m, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }, children: [
                /* @__PURE__ */ i(m, { children: [
                  /* @__PURE__ */ t(H, { variant: "h6", content: X.identifier, customColor: "var(--theme-text-primary)" }),
                  /* @__PURE__ */ t(H, { variant: "body2", content: `Source: ${X.source}`, customColor: "var(--theme-text-secondary)" })
                ] }),
                /* @__PURE__ */ t(
                  me,
                  {
                    variant: "outlined",
                    icon: "refresh",
                    label: Ee ? "Refreshing..." : "Refresh",
                    onClick: pa,
                    disabled: Ee,
                    buttonSize: "small"
                  }
                )
              ] }),
              !s.entitlementsReadonly && Cr.length > 0 && /* @__PURE__ */ i(m, { sx: { display: "flex", gap: 1, mb: 2, p: 2, bgcolor: "var(--theme-background)", borderRadius: 1 }, children: [
                /* @__PURE__ */ t(
                  La,
                  {
                    size: "small",
                    options: Cr,
                    getOptionLabel: (k) => k.name,
                    value: Cr.find((k) => k.name === Pt) || null,
                    onChange: (k, ee) => Kr((ee == null ? void 0 : ee.name) || ""),
                    renderInput: (k) => /* @__PURE__ */ t(K, { ...k, label: "Grant Entitlement", placeholder: "Select entitlement" }),
                    sx: { flex: 1 }
                  }
                ),
                /* @__PURE__ */ t(
                  me,
                  {
                    variant: "primary",
                    icon: "add",
                    label: "Grant",
                    onClick: ga,
                    disabled: !Pt || da,
                    buttonSize: "small"
                  }
                )
              ] }),
              /* @__PURE__ */ t(H, { variant: "subtitle2", content: "Current Entitlements", customColor: "var(--theme-text-secondary)", style: { marginBottom: "8px" } }),
              X.entitlements.length === 0 ? /* @__PURE__ */ t(H, { variant: "body2", content: "No entitlements found", customColor: "var(--theme-text-secondary)" }) : /* @__PURE__ */ t(m, { sx: { display: "flex", flexWrap: "wrap", gap: 1 }, children: X.entitlements.map((k, ee) => /* @__PURE__ */ t(
                de,
                {
                  icon: /* @__PURE__ */ t(Me, { sx: { fontSize: 16 } }),
                  label: k,
                  onDelete: s.entitlementsReadonly ? void 0 : () => ya(k),
                  deleteIcon: /* @__PURE__ */ t(Qt, { sx: { fontSize: 16 } }),
                  sx: {
                    bgcolor: "var(--theme-success)20",
                    color: "var(--theme-success)",
                    "& .MuiChip-deleteIcon": {
                      color: "var(--theme-error)",
                      "&:hover": {
                        color: "var(--theme-error)"
                      }
                    }
                  }
                },
                ee
              )) }),
              /* @__PURE__ */ i(m, { sx: { mt: 2, pt: 2, borderTop: 1, borderColor: "var(--theme-border)" }, children: [
                /* @__PURE__ */ t(H, { variant: "caption", content: `Data from: ${X.source === "cache" ? "Cache" : "Source"}`, customColor: "var(--theme-text-secondary)" }),
                X.cachedAt && /* @__PURE__ */ t(H, { variant: "caption", content: ` | Cached: ${gt(X.cachedAt)}`, customColor: "var(--theme-text-secondary)" }),
                s.entitlementsReadonly && /* @__PURE__ */ t(H, { variant: "caption", content: " | Read-only mode (modifications disabled)", customColor: "var(--theme-warning)" })
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ t(Et, { children: /* @__PURE__ */ t(me, { variant: "text", label: "Close", onClick: () => Fe(!1) }) })
        ]
      }
    )
  ] }) : /* @__PURE__ */ t(m, { sx: { display: "flex", justifyContent: "center", py: 8 }, children: /* @__PURE__ */ t(le, {}) });
}
const Tn = te(/* @__PURE__ */ t("path", {
  d: "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2m-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2m3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1z"
}), "Lock");
function Ml({
  title: e = "Entitlements",
  subtitle: r = "Manage available entitlements",
  headerActions: n
}) {
  var Z;
  const [a, o] = f(null), [s, l] = f(!0), [c, h] = f([]), [u, p] = f([]), [g, v] = f(!0), [w, b] = f(null), [A, $] = f(null), [N, O] = f(""), [E, y] = f(!1), [P, D] = f(!1), [V, j] = f(!1), [B, ce] = f(null), [R, d] = f({
    name: "",
    category: "",
    description: ""
  }), [z, C] = f(!1);
  oe(() => {
    Q.getEntitlementsStatus().then(o).catch((T) => b(T instanceof Error ? T.message : "Failed to get status")).finally(() => l(!1));
  }, []);
  const M = Se(async () => {
    v(!0);
    try {
      const T = await Q.getAvailableEntitlements();
      h(T), b(null);
    } catch (T) {
      b(T instanceof Error ? T.message : "Failed to fetch entitlements");
    } finally {
      v(!1);
    }
  }, []);
  oe(() => {
    M();
  }, [M]), oe(() => {
    if (!N.trim())
      p(c);
    else {
      const T = N.toLowerCase();
      p(
        c.filter(
          (ye) => {
            var Ce, re;
            return ye.name.toLowerCase().includes(T) || ((Ce = ye.category) == null ? void 0 : Ce.toLowerCase().includes(T)) || ((re = ye.description) == null ? void 0 : re.toLowerCase().includes(T));
          }
        )
      );
    }
  }, [c, N]);
  const U = [...new Set(c.map((T) => T.category || "Uncategorized"))], he = async () => {
    if (!R.name.trim()) {
      b("Name is required");
      return;
    }
    C(!0);
    try {
      $(`Entitlement "${R.name}" created`), y(!1), d({ name: "", category: "", description: "" }), M();
    } catch (T) {
      b(T instanceof Error ? T.message : "Failed to create entitlement");
    } finally {
      C(!1);
    }
  }, G = async () => {
    if (B) {
      C(!0);
      try {
        $(`Entitlement "${B.name}" updated`), D(!1), ce(null), M();
      } catch (T) {
        b(T instanceof Error ? T.message : "Failed to update entitlement");
      } finally {
        C(!1);
      }
    }
  }, be = async () => {
    if (B) {
      C(!0);
      try {
        $(`Entitlement "${B.name}" deleted`), j(!1), ce(null), M();
      } catch (T) {
        b(T instanceof Error ? T.message : "Failed to delete entitlement");
      } finally {
        C(!1);
      }
    }
  }, L = (T) => {
    ce(T), D(!0);
  }, q = (T) => {
    ce(T), j(!0);
  }, J = (a == null ? void 0 : a.readonly) ?? !0;
  return s ? /* @__PURE__ */ t(m, { sx: { display: "flex", justifyContent: "center", py: 8 }, children: /* @__PURE__ */ t(le, {}) }) : /* @__PURE__ */ i(m, { children: [
    /* @__PURE__ */ i(m, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }, children: [
      /* @__PURE__ */ i(m, { children: [
        /* @__PURE__ */ t(H, { variant: "h4", content: e, customColor: "var(--theme-text-primary)" }),
        /* @__PURE__ */ t(H, { variant: "body2", content: r, customColor: "var(--theme-text-secondary)" })
      ] }),
      /* @__PURE__ */ i(m, { sx: { display: "flex", gap: 1 }, children: [
        n,
        !J && /* @__PURE__ */ t(
          me,
          {
            variant: "primary",
            icon: "add",
            label: "Add Entitlement",
            onClick: () => y(!0)
          }
        )
      ] })
    ] }),
    g && /* @__PURE__ */ t(Gt, { sx: { mb: 2 } }),
    w && /* @__PURE__ */ t(Y, { severity: "error", onClose: () => b(null), sx: { mb: 2 }, children: w }),
    A && /* @__PURE__ */ t(Y, { severity: "success", onClose: () => $(null), sx: { mb: 2 }, children: A }),
    /* @__PURE__ */ i(ir, { columns: 3, spacing: "medium", sx: { mb: 3 }, equalHeight: !0, children: [
      /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        /* @__PURE__ */ t(Vt, { sx: { fontSize: 40, color: "var(--theme-primary)" } }),
        /* @__PURE__ */ i(m, { children: [
          /* @__PURE__ */ t(H, { variant: "h4", content: c.length.toString(), customColor: "var(--theme-text-primary)" }),
          /* @__PURE__ */ t(H, { variant: "body2", content: "Total Entitlements", customColor: "var(--theme-text-secondary)" })
        ] })
      ] }) }) }),
      /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        /* @__PURE__ */ t(
          m,
          {
            sx: {
              width: 40,
              height: 40,
              borderRadius: 1,
              bgcolor: "var(--theme-primary)20",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            },
            children: /* @__PURE__ */ t(H, { variant: "h6", content: U.length.toString(), customColor: "var(--theme-primary)" })
          }
        ),
        /* @__PURE__ */ i(m, { children: [
          /* @__PURE__ */ t(H, { variant: "body1", fontWeight: "500", content: "Categories", customColor: "var(--theme-text-primary)" }),
          /* @__PURE__ */ t(H, { variant: "body2", content: U.slice(0, 3).join(", "), customColor: "var(--theme-text-secondary)" })
        ] })
      ] }) }) }),
      /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        J ? /* @__PURE__ */ t(Tn, { sx: { fontSize: 40, color: "var(--theme-warning)" } }) : /* @__PURE__ */ t(Mr, { sx: { fontSize: 40, color: "var(--theme-success)" } }),
        /* @__PURE__ */ i(m, { children: [
          /* @__PURE__ */ t(
            H,
            {
              variant: "body1",
              fontWeight: "500",
              content: J ? "Read-only" : "Editable",
              customColor: J ? "var(--theme-warning)" : "var(--theme-success)"
            }
          ),
          /* @__PURE__ */ t(H, { variant: "body2", content: `Source: ${((Z = a == null ? void 0 : a.sources[0]) == null ? void 0 : Z.name) || "Unknown"}`, customColor: "var(--theme-text-secondary)" })
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ i(W, { sx: { p: 0 }, children: [
      /* @__PURE__ */ t(m, { sx: { p: 2, borderBottom: 1, borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(
        K,
        {
          size: "small",
          placeholder: "Search entitlements...",
          value: N,
          onChange: (T) => O(T.target.value),
          InputProps: {
            startAdornment: /* @__PURE__ */ t(Zt, { position: "start", children: /* @__PURE__ */ t(Vr, { sx: { color: "var(--theme-text-secondary)" } }) })
          },
          sx: { minWidth: 300 }
        }
      ) }),
      /* @__PURE__ */ t(nt, { children: /* @__PURE__ */ i(at, { children: [
        /* @__PURE__ */ t(ot, { children: /* @__PURE__ */ i(xe, { children: [
          /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Name" }),
          /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Category" }),
          /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Description" }),
          !J && /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, align: "right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ i(st, { children: [
          u.map((T) => /* @__PURE__ */ i(xe, { hover: !0, children: [
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
              /* @__PURE__ */ t(Vt, { sx: { fontSize: 18, color: "var(--theme-primary)" } }),
              /* @__PURE__ */ t(H, { variant: "body1", content: T.name, fontWeight: "500" })
            ] }) }),
            /* @__PURE__ */ t(_, { sx: { borderColor: "var(--theme-border)" }, children: T.category ? /* @__PURE__ */ t(
              de,
              {
                size: "small",
                label: T.category,
                sx: {
                  bgcolor: "var(--theme-primary)20",
                  color: "var(--theme-primary)"
                }
              }
            ) : /* @__PURE__ */ t(H, { variant: "body2", content: "--", customColor: "var(--theme-text-secondary)" }) }),
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", maxWidth: 300 }, children: T.description || "--" }),
            !J && /* @__PURE__ */ i(_, { sx: { borderColor: "var(--theme-border)" }, align: "right", children: [
              /* @__PURE__ */ t(Pe, { title: "Edit", children: /* @__PURE__ */ t(Be, { size: "small", onClick: () => L(T), children: /* @__PURE__ */ t(Mr, { fontSize: "small" }) }) }),
              /* @__PURE__ */ t(Pe, { title: "Delete", children: /* @__PURE__ */ t(Be, { size: "small", onClick: () => q(T), sx: { color: "var(--theme-error)" }, children: /* @__PURE__ */ t(Qt, { fontSize: "small" }) }) })
            ] })
          ] }, T.id)),
          u.length === 0 && !g && /* @__PURE__ */ t(xe, { children: /* @__PURE__ */ t(_, { colSpan: J ? 3 : 4, align: "center", sx: { py: 4, color: "var(--theme-text-secondary)" }, children: N ? "No entitlements match your search" : "No entitlements defined" }) })
        ] })
      ] }) })
    ] }) }),
    a && a.sources.length > 0 && /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", mt: 3 }, children: /* @__PURE__ */ i(W, { children: [
      /* @__PURE__ */ t(H, { variant: "subtitle2", content: "Entitlement Sources", customColor: "var(--theme-text-secondary)", style: { marginBottom: "12px" } }),
      /* @__PURE__ */ t(m, { sx: { display: "flex", flexDirection: "column", gap: 1 }, children: a.sources.map((T, ye) => /* @__PURE__ */ i(m, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        /* @__PURE__ */ t(
          de,
          {
            size: "small",
            label: T.primary ? "Primary" : "Additional",
            sx: {
              bgcolor: T.primary ? "var(--theme-primary)20" : "var(--theme-text-secondary)20",
              color: T.primary ? "var(--theme-primary)" : "var(--theme-text-secondary)"
            }
          }
        ),
        /* @__PURE__ */ t(H, { variant: "body1", content: T.name, fontWeight: "500", customColor: "var(--theme-text-primary)" }),
        T.description && /* @__PURE__ */ t(H, { variant: "body2", content: `- ${T.description}`, customColor: "var(--theme-text-secondary)" }),
        T.readonly && /* @__PURE__ */ t(
          de,
          {
            size: "small",
            icon: /* @__PURE__ */ t(Tn, { sx: { fontSize: 14 } }),
            label: "Read-only",
            sx: {
              bgcolor: "var(--theme-warning)20",
              color: "var(--theme-warning)"
            }
          }
        )
      ] }, ye)) }),
      a.cacheEnabled && /* @__PURE__ */ t(m, { sx: { mt: 2, pt: 2, borderTop: 1, borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(H, { variant: "caption", content: `Caching: Enabled (TTL: ${a.cacheTtl}s)`, customColor: "var(--theme-text-secondary)" }) })
    ] }) }),
    !J && /* @__PURE__ */ i(
      wt,
      {
        open: E,
        onClose: () => y(!1),
        maxWidth: "sm",
        fullWidth: !0,
        children: [
          /* @__PURE__ */ t(St, { children: "Add Entitlement" }),
          /* @__PURE__ */ t(kt, { children: /* @__PURE__ */ i(m, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [
            /* @__PURE__ */ t(
              K,
              {
                label: "Name",
                fullWidth: !0,
                value: R.name,
                onChange: (T) => d({ ...R, name: T.target.value }),
                placeholder: "e.g., premium, pro, feature:analytics",
                required: !0
              }
            ),
            /* @__PURE__ */ t(
              K,
              {
                label: "Category (Optional)",
                fullWidth: !0,
                value: R.category,
                onChange: (T) => d({ ...R, category: T.target.value }),
                placeholder: "e.g., subscription, feature, access"
              }
            ),
            /* @__PURE__ */ t(
              K,
              {
                label: "Description (Optional)",
                fullWidth: !0,
                multiline: !0,
                rows: 2,
                value: R.description,
                onChange: (T) => d({ ...R, description: T.target.value }),
                placeholder: "Describe what this entitlement grants access to"
              }
            )
          ] }) }),
          /* @__PURE__ */ i(Et, { children: [
            /* @__PURE__ */ t(me, { variant: "text", label: "Cancel", onClick: () => y(!1) }),
            /* @__PURE__ */ t(
              me,
              {
                variant: "primary",
                label: "Create",
                onClick: he,
                disabled: !R.name.trim() || z
              }
            )
          ] })
        ]
      }
    ),
    !J && B && /* @__PURE__ */ i(
      wt,
      {
        open: P,
        onClose: () => D(!1),
        maxWidth: "sm",
        fullWidth: !0,
        children: [
          /* @__PURE__ */ t(St, { children: "Edit Entitlement" }),
          /* @__PURE__ */ t(kt, { children: /* @__PURE__ */ i(m, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [
            /* @__PURE__ */ t(
              K,
              {
                label: "Name",
                fullWidth: !0,
                value: B.name,
                disabled: !0,
                helperText: "Name cannot be changed"
              }
            ),
            /* @__PURE__ */ t(
              K,
              {
                label: "Category",
                fullWidth: !0,
                value: B.category || "",
                onChange: (T) => ce({ ...B, category: T.target.value })
              }
            ),
            /* @__PURE__ */ t(
              K,
              {
                label: "Description",
                fullWidth: !0,
                multiline: !0,
                rows: 2,
                value: B.description || "",
                onChange: (T) => ce({ ...B, description: T.target.value })
              }
            )
          ] }) }),
          /* @__PURE__ */ i(Et, { children: [
            /* @__PURE__ */ t(me, { variant: "text", label: "Cancel", onClick: () => D(!1) }),
            /* @__PURE__ */ t(
              me,
              {
                variant: "primary",
                label: "Save",
                onClick: G,
                disabled: z
              }
            )
          ] })
        ]
      }
    ),
    !J && B && /* @__PURE__ */ i(
      wt,
      {
        open: V,
        onClose: () => j(!1),
        maxWidth: "sm",
        fullWidth: !0,
        children: [
          /* @__PURE__ */ t(St, { children: "Delete Entitlement" }),
          /* @__PURE__ */ i(kt, { children: [
            /* @__PURE__ */ t(
              H,
              {
                variant: "body1",
                content: `Are you sure you want to delete the entitlement "${B.name}"?`,
                customColor: "var(--theme-text-primary)"
              }
            ),
            /* @__PURE__ */ t(Y, { severity: "warning", sx: { mt: 2 }, children: "This will remove the entitlement from all users who currently have it." })
          ] }),
          /* @__PURE__ */ i(Et, { children: [
            /* @__PURE__ */ t(me, { variant: "text", label: "Cancel", onClick: () => j(!1) }),
            /* @__PURE__ */ t(
              me,
              {
                variant: "primary",
                color: "error",
                label: "Delete",
                onClick: be,
                disabled: z
              }
            )
          ] })
        ]
      }
    )
  ] });
}
function Rl({
  token: e,
  title: r = "Accept Invitation",
  subtitle: n = "Activate your account",
  successMessage: a = "Your account has been activated successfully!",
  redirectUrl: o,
  redirectLabel: s = "Go to App",
  onSuccess: l,
  onError: c
}) {
  const [h, u] = f(!0), [p, g] = f(null), [v, w] = f(!1), [b, A] = f(null);
  oe(() => {
    (async () => {
      let O = e;
      if (O || (O = new URLSearchParams(window.location.search).get("token") || ""), !O) {
        g("No invitation token provided"), u(!1), c == null || c("No invitation token provided");
        return;
      }
      try {
        const E = await Q.acceptInvitation(O);
        A(E.user), w(!0), l == null || l(E.user);
      } catch (E) {
        const y = E instanceof Error ? E.message : "Failed to accept invitation";
        g(y), c == null || c(y);
      } finally {
        u(!1);
      }
    })();
  }, [e, l, c]);
  const $ = () => {
    o && (window.location.href = o);
  };
  return /* @__PURE__ */ t(
    m,
    {
      sx: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "var(--theme-background)",
        p: 3
      },
      children: /* @__PURE__ */ t(F, { sx: { maxWidth: 500, width: "100%", bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ i(W, { sx: { p: 4 }, children: [
        /* @__PURE__ */ i(m, { sx: { textAlign: "center", mb: 4 }, children: [
          /* @__PURE__ */ t(H, { variant: "h4", content: r, customColor: "var(--theme-text-primary)", style: { marginBottom: "8px" } }),
          /* @__PURE__ */ t(H, { variant: "body2", content: n, customColor: "var(--theme-text-secondary)" })
        ] }),
        h && /* @__PURE__ */ i(m, { sx: { display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 4 }, children: [
          /* @__PURE__ */ t(le, {}),
          /* @__PURE__ */ t(H, { variant: "body2", content: "Activating your account...", customColor: "var(--theme-text-secondary)" })
        ] }),
        p && !h && /* @__PURE__ */ i(m, { sx: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }, children: [
          /* @__PURE__ */ t(Ne, { sx: { fontSize: 64, color: "var(--theme-error)" } }),
          /* @__PURE__ */ t(Y, { severity: "error", sx: { width: "100%" }, children: p }),
          /* @__PURE__ */ t(
            H,
            {
              variant: "body2",
              content: "The invitation may have expired or is invalid. Please contact support.",
              customColor: "var(--theme-text-secondary)",
              style: { textAlign: "center" }
            }
          )
        ] }),
        v && !h && /* @__PURE__ */ i(m, { sx: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }, children: [
          /* @__PURE__ */ t(Me, { sx: { fontSize: 64, color: "var(--theme-success)" } }),
          /* @__PURE__ */ t(Y, { severity: "success", sx: { width: "100%" }, children: a }),
          b && /* @__PURE__ */ i(m, { sx: { width: "100%", textAlign: "center" }, children: [
            /* @__PURE__ */ t(
              H,
              {
                variant: "body1",
                content: `Welcome, ${b.name || b.email}!`,
                customColor: "var(--theme-text-primary)",
                fontWeight: "500",
                style: { marginBottom: "4px" }
              }
            ),
            /* @__PURE__ */ t(
              H,
              {
                variant: "body2",
                content: "Your account is now active and ready to use.",
                customColor: "var(--theme-text-secondary)"
              }
            )
          ] }),
          o && /* @__PURE__ */ t(
            me,
            {
              variant: "primary",
              label: s,
              icon: "arrow_forward",
              onClick: $,
              fullWidth: !0
            }
          )
        ] })
      ] }) })
    }
  );
}
const Ll = ({
  title: e,
  icon: r,
  status: n,
  health: a,
  stats: o = [],
  actions: s = [],
  message: l,
  loading: c = !1
}) => {
  const h = n || a || "disabled", u = {
    healthy: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
    disabled: "bg-gray-400"
  }, p = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white"
  };
  return c ? /* @__PURE__ */ t("div", { className: "rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6", children: /* @__PURE__ */ i("div", { className: "animate-pulse", children: [
    /* @__PURE__ */ t("div", { className: "h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" }),
    /* @__PURE__ */ i("div", { className: "space-y-3", children: [
      /* @__PURE__ */ t("div", { className: "h-4 bg-gray-200 dark:bg-gray-700 rounded" }),
      /* @__PURE__ */ t("div", { className: "h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" })
    ] })
  ] }) }) : /* @__PURE__ */ i("div", { className: "rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6", children: [
    /* @__PURE__ */ i("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ i("div", { className: "flex items-center gap-3", children: [
        r && /* @__PURE__ */ t("div", { className: "text-2xl text-gray-600 dark:text-gray-400", children: r }),
        /* @__PURE__ */ i("div", { children: [
          /* @__PURE__ */ t("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: e }),
          l && /* @__PURE__ */ t("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: l })
        ] })
      ] }),
      /* @__PURE__ */ t(
        "div",
        {
          className: `w-3 h-3 rounded-full ${u[h]}`,
          title: h
        }
      )
    ] }),
    o.length > 0 && /* @__PURE__ */ t("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4", children: o.map((g, v) => /* @__PURE__ */ t(Wt, { ...g }, v)) }),
    s.length > 0 && /* @__PURE__ */ t("div", { className: "flex flex-wrap gap-2 mt-4", children: s.map((g, v) => /* @__PURE__ */ t(
      "button",
      {
        onClick: g.onClick,
        className: `
                px-4 py-2 rounded-md text-sm font-medium
                transition-colors
                ${p[g.variant || "secondary"]}
              `,
        children: g.label
      },
      v
    )) })
  ] });
}, Wl = ({
  title: e,
  description: r,
  icon: n,
  searchPlaceholder: a,
  onSearch: o,
  actions: s = [],
  filters: l,
  tabs: c,
  activeTab: h,
  onTabChange: u,
  children: p,
  loading: g = !1,
  breadcrumbs: v
}) => {
  const w = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white"
  };
  return /* @__PURE__ */ i("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
    v && v.length > 0 && /* @__PURE__ */ t("nav", { className: "mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400", children: v.map((b, A) => /* @__PURE__ */ i(Ca.Fragment, { children: [
      A > 0 && /* @__PURE__ */ t("span", { children: "/" }),
      b.href ? /* @__PURE__ */ t("a", { href: b.href, className: "hover:text-gray-900 dark:hover:text-gray-100", children: b.label }) : /* @__PURE__ */ t("span", { className: "text-gray-900 dark:text-gray-100 font-medium", children: b.label })
    ] }, A)) }),
    /* @__PURE__ */ t("div", { className: "mb-8", children: /* @__PURE__ */ i("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ i("div", { className: "flex items-start gap-4", children: [
        n && /* @__PURE__ */ t("div", { className: "text-4xl text-gray-600 dark:text-gray-400 mt-1", children: n }),
        /* @__PURE__ */ i("div", { children: [
          /* @__PURE__ */ t("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white", children: e }),
          r && /* @__PURE__ */ t("p", { className: "mt-2 text-gray-600 dark:text-gray-400", children: r })
        ] })
      ] }),
      s.length > 0 && /* @__PURE__ */ t("div", { className: "flex gap-2", children: s.map((b, A) => /* @__PURE__ */ i(
        "button",
        {
          onClick: b.onClick,
          className: `
                    flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
                    transition-colors
                    ${w[b.variant || "secondary"]}
                  `,
          children: [
            b.icon,
            b.label
          ]
        },
        A
      )) })
    ] }) }),
    c && c.length > 0 && /* @__PURE__ */ t("div", { className: "mb-6 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ t("nav", { className: "flex space-x-8", children: c.map((b) => /* @__PURE__ */ t(
      "button",
      {
        onClick: () => u == null ? void 0 : u(b.id),
        className: `
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${h === b.id ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"}
                `,
        children: b.label
      },
      b.id
    )) }) }),
    (o || l) && /* @__PURE__ */ i("div", { className: "mb-6 flex flex-col sm:flex-row gap-4", children: [
      o && /* @__PURE__ */ t("div", { className: "flex-1", children: /* @__PURE__ */ t(
        "input",
        {
          type: "search",
          placeholder: a || "Search...",
          onChange: (b) => o(b.target.value),
          className: `
                  w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-800
                  text-gray-900 dark:text-white
                  placeholder-gray-500 dark:placeholder-gray-400
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                `
        }
      ) }),
      l && /* @__PURE__ */ t("div", { className: "flex gap-2", children: l })
    ] }),
    /* @__PURE__ */ t("div", { className: g ? "opacity-50 pointer-events-none" : "", children: p })
  ] });
}, jl = ({
  title: e,
  description: r,
  config: n,
  schema: a,
  onSave: o,
  onReset: s,
  loading: l = !1,
  readOnly: c = !1
}) => {
  const [h, u] = f(n), [p, g] = f({}), [v, w] = f(!1), [b, A] = f(!1);
  oe(() => {
    u(n);
  }, [n]);
  const $ = (y, P) => y.required && (P == null || P === "") ? `${y.label} is required` : y.pattern && typeof P == "string" && !y.pattern.test(P) ? `${y.label} format is invalid` : y.validate ? y.validate(P) : null, N = (y, P) => {
    u({ ...h, [y]: P }), A(!1), p[y] && g({ ...p, [y]: "" });
  }, O = async () => {
    const y = {};
    if (a.forEach((P) => {
      const D = $(P, h[P.key]);
      D && (y[P.key] = D);
    }), Object.keys(y).length > 0) {
      g(y);
      return;
    }
    w(!0);
    try {
      await o(h), A(!0), setTimeout(() => A(!1), 3e3);
    } catch (P) {
      console.error("Failed to save config:", P);
    } finally {
      w(!1);
    }
  }, E = (y) => {
    var j;
    const P = h[y.key], V = `
      w-full px-3 py-2 rounded-md border
      ${!!p[y.key] ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"}
      bg-white dark:bg-gray-800
      text-gray-900 dark:text-white
      focus:ring-2 focus:border-transparent
      disabled:opacity-50 disabled:cursor-not-allowed
    `;
    switch (y.type) {
      case "boolean":
        return /* @__PURE__ */ i("label", { className: "flex items-center gap-2 cursor-pointer", children: [
          /* @__PURE__ */ t(
            "input",
            {
              type: "checkbox",
              checked: !!P,
              onChange: (B) => N(y.key, B.target.checked),
              disabled: c || l,
              className: "rounded"
            }
          ),
          /* @__PURE__ */ t("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: y.description || "Enable" })
        ] });
      case "select":
        return /* @__PURE__ */ t(
          "select",
          {
            value: String(P ?? ""),
            onChange: (B) => N(y.key, B.target.value),
            disabled: c || l,
            className: V,
            children: (j = y.options) == null ? void 0 : j.map((B) => /* @__PURE__ */ t("option", { value: B.value, children: B.label }, B.value))
          }
        );
      case "textarea":
        return /* @__PURE__ */ t(
          "textarea",
          {
            value: String(P ?? ""),
            onChange: (B) => N(y.key, B.target.value),
            disabled: c || l,
            rows: 4,
            className: V
          }
        );
      case "number":
        return /* @__PURE__ */ t(
          "input",
          {
            type: "number",
            value: Number(P ?? 0),
            onChange: (B) => N(y.key, Number(B.target.value)),
            min: y.min,
            max: y.max,
            step: y.step,
            disabled: c || l,
            className: V
          }
        );
      case "text":
      default:
        return /* @__PURE__ */ t(
          "input",
          {
            type: "text",
            value: String(P ?? ""),
            onChange: (B) => N(y.key, B.target.value),
            disabled: c || l,
            className: V
          }
        );
    }
  };
  return /* @__PURE__ */ i("div", { className: "rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6", children: [
    /* @__PURE__ */ i("div", { className: "mb-6", children: [
      /* @__PURE__ */ t("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: e }),
      r && /* @__PURE__ */ t("p", { className: "mt-1 text-gray-600 dark:text-gray-400", children: r })
    ] }),
    /* @__PURE__ */ t("div", { className: "space-y-6", children: a.map((y) => /* @__PURE__ */ i("div", { children: [
      y.type !== "boolean" && /* @__PURE__ */ i("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: [
        y.label,
        y.required && /* @__PURE__ */ t("span", { className: "text-red-500 ml-1", children: "*" })
      ] }),
      E(y),
      y.description && y.type !== "boolean" && /* @__PURE__ */ t("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: y.description }),
      p[y.key] && /* @__PURE__ */ t("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: p[y.key] })
    ] }, y.key)) }),
    !c && /* @__PURE__ */ i("div", { className: "mt-6 flex items-center gap-3", children: [
      /* @__PURE__ */ t(
        "button",
        {
          onClick: O,
          disabled: v || l,
          className: `
              px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white
              rounded-md text-sm font-medium
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            `,
          children: v ? "Saving..." : "Save Changes"
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          onClick: s,
          disabled: v || l,
          className: `
              px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900
              dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white
              rounded-md text-sm font-medium
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            `,
          children: "Reset"
        }
      ),
      b && /* @__PURE__ */ t("span", { className: "text-sm text-green-600 dark:text-green-400", children: "✓ Saved successfully" })
    ] })
  ] });
};
export {
  Rl as AcceptInvitationPage,
  Bl as ControlPanelApp,
  Zi as DashboardPage,
  xi as DashboardWidgetProvider,
  Ci as DashboardWidgetRenderer,
  Vl as DataTable,
  Ml as EntitlementsPage,
  ol as LogsPage,
  Cl as NotFoundPage,
  jl as PluginConfigPanel,
  Wl as PluginManagementPage,
  Ll as PluginStatusWidget,
  ki as PluginWidgetRenderer,
  $i as ServiceHealthWidget,
  Hl as StatCard,
  fl as SystemPage,
  _l as UsersPage,
  wi as WidgetComponentRegistryProvider,
  Q as api,
  Yi as getBuiltInWidgetComponents,
  sa as useDashboardWidgets,
  Ol as useRegisterWidget,
  Si as useWidgetComponentRegistry
};
//# sourceMappingURL=index.js.map
