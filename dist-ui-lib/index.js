var yo = Object.defineProperty;
var bo = (e, r, n) => r in e ? yo(e, r, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[r] = n;
var Ht = (e, r, n) => bo(e, typeof r != "symbol" ? r + "" : r, n);
import { jsxs as s, jsx as t, Fragment as Fe } from "react/jsx-runtime";
import * as Ue from "react";
import vo, { createContext as Tn, useState as y, useCallback as be, useContext as Pn, useMemo as xo, useEffect as te, useRef as Co } from "react";
import { useNavigate as Nn, Routes as wo, Route as At } from "react-router-dom";
import { Box as f, Typography as k, CircularProgress as re, Alert as J, Card as j, CardContent as R, Chip as ne, LinearProgress as tr, Button as ue, Divider as Dn, IconButton as Ae, List as zn, ListItem as Bn, ListItemText as On, FormControl as Jt, InputLabel as Qt, Select as Yt, MenuItem as we, Dialog as Br, DialogTitle as Or, DialogContent as Mr, DialogContentText as Mn, DialogActions as Lr, TextField as _, CardActionArea as So, Grid as Se, ToggleButtonGroup as ko, ToggleButton as Xr, Tooltip as Ee, TableContainer as Qe, Table as Ye, TableHead as Xe, TableRow as fe, TableCell as D, TableBody as Ze, Pagination as Eo, Snackbar as Io, FormControlLabel as Tt, Switch as Pt, Collapse as $o, Link as Ao, Tabs as To, Tab as Po, InputAdornment as Gt, TablePagination as No, Autocomplete as Do } from "@mui/material";
import { AppConfigBuilder as zo, Text as F, GridLayout as rr, StatCard as zt, Button as ie, QwickApp as Bo, ProductLogo as Oo, Dialog as ut, DialogTitle as mt, DialogContent as ft, DialogActions as pt } from "@qwickapps/react-framework";
import { DataTable as Dl, StatCard as zl } from "@qwickapps/react-framework";
import X from "prop-types";
import Mo from "@emotion/styled";
import "@emotion/react";
import { isValidElementType as Ln, Memo as Lo, ForwardRef as Ro } from "react-is";
const jo = zo.create().withName("Control Panel").withId("com.qwickapps.control-panel").withVersion("1.0.0").withDefaultTheme("dark").withDefaultPalette("cosmic").withThemeSwitcher(!0).withPaletteSwitcher(!0).withDisplay("standalone").build(), Zr = (e) => e, Wo = () => {
  let e = Zr;
  return {
    configure(r) {
      e = r;
    },
    generate(r) {
      return e(r);
    },
    reset() {
      e = Zr;
    }
  };
}, Fo = Wo();
function _e(e, ...r) {
  const n = new URL(`https://mui.com/production-error/?code=${e}`);
  return r.forEach((o) => n.searchParams.append("args[]", o)), `Minified MUI error #${e}; visit ${n} for the full message.`;
}
function tt(e) {
  if (typeof e != "string")
    throw new Error(process.env.NODE_ENV !== "production" ? "MUI: `capitalize(string)` expects a string argument." : _e(7));
  return e.charAt(0).toUpperCase() + e.slice(1);
}
function Rn(e) {
  var r, n, o = "";
  if (typeof e == "string" || typeof e == "number") o += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var a = e.length;
    for (r = 0; r < a; r++) e[r] && (n = Rn(e[r])) && (o && (o += " "), o += n);
  } else for (n in e) e[n] && (o && (o += " "), o += n);
  return o;
}
function jn() {
  for (var e, r, n = 0, o = "", a = arguments.length; n < a; n++) (e = arguments[n]) && (r = Rn(e)) && (o && (o += " "), o += r);
  return o;
}
function Uo(e, r, n = void 0) {
  const o = {};
  for (const a in e) {
    const i = e[a];
    let c = "", l = !0;
    for (let h = 0; h < i.length; h += 1) {
      const u = i[h];
      u && (c += (l === !0 ? "" : " ") + r(u), l = !1, n && n[u] && (c += " " + n[u]));
    }
    o[a] = c;
  }
  return o;
}
function Le(e) {
  if (typeof e != "object" || e === null)
    return !1;
  const r = Object.getPrototypeOf(e);
  return (r === null || r === Object.prototype || Object.getPrototypeOf(r) === null) && !(Symbol.toStringTag in e) && !(Symbol.iterator in e);
}
function Wn(e) {
  if (/* @__PURE__ */ Ue.isValidElement(e) || Ln(e) || !Le(e))
    return e;
  const r = {};
  return Object.keys(e).forEach((n) => {
    r[n] = Wn(e[n]);
  }), r;
}
function Ie(e, r, n = {
  clone: !0
}) {
  const o = n.clone ? {
    ...e
  } : e;
  return Le(e) && Le(r) && Object.keys(r).forEach((a) => {
    /* @__PURE__ */ Ue.isValidElement(r[a]) || Ln(r[a]) ? o[a] = r[a] : Le(r[a]) && // Avoid prototype pollution
    Object.prototype.hasOwnProperty.call(e, a) && Le(e[a]) ? o[a] = Ie(e[a], r[a], n) : n.clone ? o[a] = Le(r[a]) ? Wn(r[a]) : r[a] : o[a] = r[a];
  }), o;
}
function Mt(e, r) {
  return r ? Ie(e, r, {
    clone: !1
    // No need to clone deep, it's way faster.
  }) : e;
}
const He = process.env.NODE_ENV !== "production" ? X.oneOfType([X.number, X.string, X.object, X.array]) : {};
function en(e, r) {
  if (!e.containerQueries)
    return r;
  const n = Object.keys(r).filter((o) => o.startsWith("@container")).sort((o, a) => {
    var c, l;
    const i = /min-width:\s*([0-9.]+)/;
    return +(((c = o.match(i)) == null ? void 0 : c[1]) || 0) - +(((l = a.match(i)) == null ? void 0 : l[1]) || 0);
  });
  return n.length ? n.reduce((o, a) => {
    const i = r[a];
    return delete o[a], o[a] = i, o;
  }, {
    ...r
  }) : r;
}
function _o(e, r) {
  return r === "@" || r.startsWith("@") && (e.some((n) => r.startsWith(`@${n}`)) || !!r.match(/^@\d/));
}
function Vo(e, r) {
  const n = r.match(/^@([^/]+)?\/?(.+)?$/);
  if (!n) {
    if (process.env.NODE_ENV !== "production")
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The provided shorthand ${`(${r})`} is invalid. The format should be \`@<breakpoint | number>\` or \`@<breakpoint | number>/<container>\`.
For example, \`@sm\` or \`@600\` or \`@40rem/sidebar\`.` : _e(18, `(${r})`));
    return null;
  }
  const [, o, a] = n, i = Number.isNaN(+o) ? o || 0 : +o;
  return e.containerQueries(a).up(i);
}
function Ho(e) {
  const r = (i, c) => i.replace("@media", c ? `@container ${c}` : "@container");
  function n(i, c) {
    i.up = (...l) => r(e.breakpoints.up(...l), c), i.down = (...l) => r(e.breakpoints.down(...l), c), i.between = (...l) => r(e.breakpoints.between(...l), c), i.only = (...l) => r(e.breakpoints.only(...l), c), i.not = (...l) => {
      const h = r(e.breakpoints.not(...l), c);
      return h.includes("not all and") ? h.replace("not all and ", "").replace("min-width:", "width<").replace("max-width:", "width>").replace("and", "or") : h;
    };
  }
  const o = {}, a = (i) => (n(o, i), o);
  return n(a), {
    ...e,
    containerQueries: a
  };
}
const nr = {
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
}, tn = {
  // Sorted ASC by size. That's important.
  // It can't be configured as it's used statically for propTypes.
  keys: ["xs", "sm", "md", "lg", "xl"],
  up: (e) => `@media (min-width:${nr[e]}px)`
}, Ko = {
  containerQueries: (e) => ({
    up: (r) => {
      let n = typeof r == "number" ? r : nr[r] || r;
      return typeof n == "number" && (n = `${n}px`), e ? `@container ${e} (min-width:${n})` : `@container (min-width:${n})`;
    }
  })
};
function Re(e, r, n) {
  const o = e.theme || {};
  if (Array.isArray(r)) {
    const i = o.breakpoints || tn;
    return r.reduce((c, l, h) => (c[i.up(i.keys[h])] = n(r[h]), c), {});
  }
  if (typeof r == "object") {
    const i = o.breakpoints || tn;
    return Object.keys(r).reduce((c, l) => {
      if (_o(i.keys, l)) {
        const h = Vo(o.containerQueries ? o : Ko, l);
        h && (c[h] = n(r[l], l));
      } else if (Object.keys(i.values || nr).includes(l)) {
        const h = i.up(l);
        c[h] = n(r[l], l);
      } else {
        const h = l;
        c[h] = r[h];
      }
      return c;
    }, {});
  }
  return n(r);
}
function Go(e = {}) {
  var n;
  return ((n = e.keys) == null ? void 0 : n.reduce((o, a) => {
    const i = e.up(a);
    return o[i] = {}, o;
  }, {})) || {};
}
function rn(e, r) {
  return e.reduce((n, o) => {
    const a = n[o];
    return (!a || Object.keys(a).length === 0) && delete n[o], n;
  }, r);
}
function or(e, r, n = !0) {
  if (!r || typeof r != "string")
    return null;
  if (e && e.vars && n) {
    const o = `vars.${r}`.split(".").reduce((a, i) => a && a[i] ? a[i] : null, e);
    if (o != null)
      return o;
  }
  return r.split(".").reduce((o, a) => o && o[a] != null ? o[a] : null, e);
}
function Xt(e, r, n, o = n) {
  let a;
  return typeof e == "function" ? a = e(n) : Array.isArray(e) ? a = e[n] || o : a = or(e, n) || o, r && (a = r(a, o, e)), a;
}
function ce(e) {
  const {
    prop: r,
    cssProperty: n = e.prop,
    themeKey: o,
    transform: a
  } = e, i = (c) => {
    if (c[r] == null)
      return null;
    const l = c[r], h = c.theme, u = or(h, o) || {};
    return Re(c, l, (p) => {
      let v = Xt(u, a, p);
      return p === v && typeof p == "string" && (v = Xt(u, a, `${r}${p === "default" ? "" : tt(p)}`, p)), n === !1 ? v : {
        [n]: v
      };
    });
  };
  return i.propTypes = process.env.NODE_ENV !== "production" ? {
    [r]: He
  } : {}, i.filterProps = [r], i;
}
function qo(e) {
  const r = {};
  return (n) => (r[n] === void 0 && (r[n] = e(n)), r[n]);
}
const Jo = {
  m: "margin",
  p: "padding"
}, Qo = {
  t: "Top",
  r: "Right",
  b: "Bottom",
  l: "Left",
  x: ["Left", "Right"],
  y: ["Top", "Bottom"]
}, nn = {
  marginX: "mx",
  marginY: "my",
  paddingX: "px",
  paddingY: "py"
}, Yo = qo((e) => {
  if (e.length > 2)
    if (nn[e])
      e = nn[e];
    else
      return [e];
  const [r, n] = e.split(""), o = Jo[r], a = Qo[n] || "";
  return Array.isArray(a) ? a.map((i) => o + i) : [o + a];
}), ar = ["m", "mt", "mr", "mb", "ml", "mx", "my", "margin", "marginTop", "marginRight", "marginBottom", "marginLeft", "marginX", "marginY", "marginInline", "marginInlineStart", "marginInlineEnd", "marginBlock", "marginBlockStart", "marginBlockEnd"], ir = ["p", "pt", "pr", "pb", "pl", "px", "py", "padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "paddingX", "paddingY", "paddingInline", "paddingInlineStart", "paddingInlineEnd", "paddingBlock", "paddingBlockStart", "paddingBlockEnd"], Xo = [...ar, ...ir];
function Ft(e, r, n, o) {
  const a = or(e, r, !0) ?? n;
  return typeof a == "number" || typeof a == "string" ? (i) => typeof i == "string" ? i : (process.env.NODE_ENV !== "production" && typeof i != "number" && console.error(`MUI: Expected ${o} argument to be a number or a string, got ${i}.`), typeof a == "string" ? a.startsWith("var(") && i === 0 ? 0 : a.startsWith("var(") && i === 1 ? a : `calc(${i} * ${a})` : a * i) : Array.isArray(a) ? (i) => {
    if (typeof i == "string")
      return i;
    const c = Math.abs(i);
    process.env.NODE_ENV !== "production" && (Number.isInteger(c) ? c > a.length - 1 && console.error([`MUI: The value provided (${c}) overflows.`, `The supported values are: ${JSON.stringify(a)}.`, `${c} > ${a.length - 1}, you need to add the missing values.`].join(`
`)) : console.error([`MUI: The \`theme.${r}\` array type cannot be combined with non integer values.You should either use an integer value that can be used as index, or define the \`theme.${r}\` as a number.`].join(`
`)));
    const l = a[c];
    return i >= 0 ? l : typeof l == "number" ? -l : typeof l == "string" && l.startsWith("var(") ? `calc(-1 * ${l})` : `-${l}`;
  } : typeof a == "function" ? a : (process.env.NODE_ENV !== "production" && console.error([`MUI: The \`theme.${r}\` value (${a}) is invalid.`, "It should be a number, an array or a function."].join(`
`)), () => {
  });
}
function Rr(e) {
  return Ft(e, "spacing", 8, "spacing");
}
function Ut(e, r) {
  return typeof r == "string" || r == null ? r : e(r);
}
function Zo(e, r) {
  return (n) => e.reduce((o, a) => (o[a] = Ut(r, n), o), {});
}
function ea(e, r, n, o) {
  if (!r.includes(n))
    return null;
  const a = Yo(n), i = Zo(a, o), c = e[n];
  return Re(e, c, i);
}
function Fn(e, r) {
  const n = Rr(e.theme);
  return Object.keys(e).map((o) => ea(e, r, o, n)).reduce(Mt, {});
}
function se(e) {
  return Fn(e, ar);
}
se.propTypes = process.env.NODE_ENV !== "production" ? ar.reduce((e, r) => (e[r] = He, e), {}) : {};
se.filterProps = ar;
function le(e) {
  return Fn(e, ir);
}
le.propTypes = process.env.NODE_ENV !== "production" ? ir.reduce((e, r) => (e[r] = He, e), {}) : {};
le.filterProps = ir;
process.env.NODE_ENV !== "production" && Xo.reduce((e, r) => (e[r] = He, e), {});
function sr(...e) {
  const r = e.reduce((o, a) => (a.filterProps.forEach((i) => {
    o[i] = a;
  }), o), {}), n = (o) => Object.keys(o).reduce((a, i) => r[i] ? Mt(a, r[i](o)) : a, {});
  return n.propTypes = process.env.NODE_ENV !== "production" ? e.reduce((o, a) => Object.assign(o, a.propTypes), {}) : {}, n.filterProps = e.reduce((o, a) => o.concat(a.filterProps), []), n;
}
function $e(e) {
  return typeof e != "number" ? e : `${e}px solid`;
}
function Te(e, r) {
  return ce({
    prop: e,
    themeKey: "borders",
    transform: r
  });
}
const ta = Te("border", $e), ra = Te("borderTop", $e), na = Te("borderRight", $e), oa = Te("borderBottom", $e), aa = Te("borderLeft", $e), ia = Te("borderColor"), sa = Te("borderTopColor"), la = Te("borderRightColor"), ca = Te("borderBottomColor"), da = Te("borderLeftColor"), ha = Te("outline", $e), ua = Te("outlineColor"), lr = (e) => {
  if (e.borderRadius !== void 0 && e.borderRadius !== null) {
    const r = Ft(e.theme, "shape.borderRadius", 4, "borderRadius"), n = (o) => ({
      borderRadius: Ut(r, o)
    });
    return Re(e, e.borderRadius, n);
  }
  return null;
};
lr.propTypes = process.env.NODE_ENV !== "production" ? {
  borderRadius: He
} : {};
lr.filterProps = ["borderRadius"];
sr(ta, ra, na, oa, aa, ia, sa, la, ca, da, lr, ha, ua);
const cr = (e) => {
  if (e.gap !== void 0 && e.gap !== null) {
    const r = Ft(e.theme, "spacing", 8, "gap"), n = (o) => ({
      gap: Ut(r, o)
    });
    return Re(e, e.gap, n);
  }
  return null;
};
cr.propTypes = process.env.NODE_ENV !== "production" ? {
  gap: He
} : {};
cr.filterProps = ["gap"];
const dr = (e) => {
  if (e.columnGap !== void 0 && e.columnGap !== null) {
    const r = Ft(e.theme, "spacing", 8, "columnGap"), n = (o) => ({
      columnGap: Ut(r, o)
    });
    return Re(e, e.columnGap, n);
  }
  return null;
};
dr.propTypes = process.env.NODE_ENV !== "production" ? {
  columnGap: He
} : {};
dr.filterProps = ["columnGap"];
const hr = (e) => {
  if (e.rowGap !== void 0 && e.rowGap !== null) {
    const r = Ft(e.theme, "spacing", 8, "rowGap"), n = (o) => ({
      rowGap: Ut(r, o)
    });
    return Re(e, e.rowGap, n);
  }
  return null;
};
hr.propTypes = process.env.NODE_ENV !== "production" ? {
  rowGap: He
} : {};
hr.filterProps = ["rowGap"];
const ma = ce({
  prop: "gridColumn"
}), fa = ce({
  prop: "gridRow"
}), pa = ce({
  prop: "gridAutoFlow"
}), ga = ce({
  prop: "gridAutoColumns"
}), ya = ce({
  prop: "gridAutoRows"
}), ba = ce({
  prop: "gridTemplateColumns"
}), va = ce({
  prop: "gridTemplateRows"
}), xa = ce({
  prop: "gridTemplateAreas"
}), Ca = ce({
  prop: "gridArea"
});
sr(cr, dr, hr, ma, fa, pa, ga, ya, ba, va, xa, Ca);
function gt(e, r) {
  return r === "grey" ? r : e;
}
const wa = ce({
  prop: "color",
  themeKey: "palette",
  transform: gt
}), Sa = ce({
  prop: "bgcolor",
  cssProperty: "backgroundColor",
  themeKey: "palette",
  transform: gt
}), ka = ce({
  prop: "backgroundColor",
  themeKey: "palette",
  transform: gt
});
sr(wa, Sa, ka);
function ke(e) {
  return e <= 1 && e !== 0 ? `${e * 100}%` : e;
}
const Ea = ce({
  prop: "width",
  transform: ke
}), jr = (e) => {
  if (e.maxWidth !== void 0 && e.maxWidth !== null) {
    const r = (n) => {
      var a, i, c, l, h;
      const o = ((c = (i = (a = e.theme) == null ? void 0 : a.breakpoints) == null ? void 0 : i.values) == null ? void 0 : c[n]) || nr[n];
      return o ? ((h = (l = e.theme) == null ? void 0 : l.breakpoints) == null ? void 0 : h.unit) !== "px" ? {
        maxWidth: `${o}${e.theme.breakpoints.unit}`
      } : {
        maxWidth: o
      } : {
        maxWidth: ke(n)
      };
    };
    return Re(e, e.maxWidth, r);
  }
  return null;
};
jr.filterProps = ["maxWidth"];
const Ia = ce({
  prop: "minWidth",
  transform: ke
}), $a = ce({
  prop: "height",
  transform: ke
}), Aa = ce({
  prop: "maxHeight",
  transform: ke
}), Ta = ce({
  prop: "minHeight",
  transform: ke
});
ce({
  prop: "size",
  cssProperty: "width",
  transform: ke
});
ce({
  prop: "size",
  cssProperty: "height",
  transform: ke
});
const Pa = ce({
  prop: "boxSizing"
});
sr(Ea, jr, Ia, $a, Aa, Ta, Pa);
const ur = {
  // borders
  border: {
    themeKey: "borders",
    transform: $e
  },
  borderTop: {
    themeKey: "borders",
    transform: $e
  },
  borderRight: {
    themeKey: "borders",
    transform: $e
  },
  borderBottom: {
    themeKey: "borders",
    transform: $e
  },
  borderLeft: {
    themeKey: "borders",
    transform: $e
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
    transform: $e
  },
  outlineColor: {
    themeKey: "palette"
  },
  borderRadius: {
    themeKey: "shape.borderRadius",
    style: lr
  },
  // palette
  color: {
    themeKey: "palette",
    transform: gt
  },
  bgcolor: {
    themeKey: "palette",
    cssProperty: "backgroundColor",
    transform: gt
  },
  backgroundColor: {
    themeKey: "palette",
    transform: gt
  },
  // spacing
  p: {
    style: le
  },
  pt: {
    style: le
  },
  pr: {
    style: le
  },
  pb: {
    style: le
  },
  pl: {
    style: le
  },
  px: {
    style: le
  },
  py: {
    style: le
  },
  padding: {
    style: le
  },
  paddingTop: {
    style: le
  },
  paddingRight: {
    style: le
  },
  paddingBottom: {
    style: le
  },
  paddingLeft: {
    style: le
  },
  paddingX: {
    style: le
  },
  paddingY: {
    style: le
  },
  paddingInline: {
    style: le
  },
  paddingInlineStart: {
    style: le
  },
  paddingInlineEnd: {
    style: le
  },
  paddingBlock: {
    style: le
  },
  paddingBlockStart: {
    style: le
  },
  paddingBlockEnd: {
    style: le
  },
  m: {
    style: se
  },
  mt: {
    style: se
  },
  mr: {
    style: se
  },
  mb: {
    style: se
  },
  ml: {
    style: se
  },
  mx: {
    style: se
  },
  my: {
    style: se
  },
  margin: {
    style: se
  },
  marginTop: {
    style: se
  },
  marginRight: {
    style: se
  },
  marginBottom: {
    style: se
  },
  marginLeft: {
    style: se
  },
  marginX: {
    style: se
  },
  marginY: {
    style: se
  },
  marginInline: {
    style: se
  },
  marginInlineStart: {
    style: se
  },
  marginInlineEnd: {
    style: se
  },
  marginBlock: {
    style: se
  },
  marginBlockStart: {
    style: se
  },
  marginBlockEnd: {
    style: se
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
    style: cr
  },
  rowGap: {
    style: hr
  },
  columnGap: {
    style: dr
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
    transform: ke
  },
  maxWidth: {
    style: jr
  },
  minWidth: {
    transform: ke
  },
  height: {
    transform: ke
  },
  maxHeight: {
    transform: ke
  },
  minHeight: {
    transform: ke
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
function Na(...e) {
  const r = e.reduce((o, a) => o.concat(Object.keys(a)), []), n = new Set(r);
  return e.every((o) => n.size === Object.keys(o).length);
}
function Da(e, r) {
  return typeof e == "function" ? e(r) : e;
}
function za() {
  function e(n, o, a, i) {
    const c = {
      [n]: o,
      theme: a
    }, l = i[n];
    if (!l)
      return {
        [n]: o
      };
    const {
      cssProperty: h = n,
      themeKey: u,
      transform: m,
      style: p
    } = l;
    if (o == null)
      return null;
    if (u === "typography" && o === "inherit")
      return {
        [n]: o
      };
    const v = or(a, u) || {};
    return p ? p(c) : Re(c, o, (g) => {
      let A = Xt(v, m, g);
      return g === A && typeof g == "string" && (A = Xt(v, m, `${n}${g === "default" ? "" : tt(g)}`, g)), h === !1 ? A : {
        [h]: A
      };
    });
  }
  function r(n) {
    const {
      sx: o,
      theme: a = {},
      nested: i
    } = n || {};
    if (!o)
      return null;
    const c = a.unstable_sxConfig ?? ur;
    function l(h) {
      let u = h;
      if (typeof h == "function")
        u = h(a);
      else if (typeof h != "object")
        return h;
      if (!u)
        return null;
      const m = Go(a.breakpoints), p = Object.keys(m);
      let v = m;
      return Object.keys(u).forEach((S) => {
        const g = Da(u[S], a);
        if (g != null)
          if (typeof g == "object")
            if (c[S])
              v = Mt(v, e(S, g, a, c));
            else {
              const A = Re({
                theme: a
              }, g, ($) => ({
                [S]: $
              }));
              Na(A, g) ? v[S] = r({
                sx: g,
                theme: a,
                nested: !0
              }) : v = Mt(v, A);
            }
          else
            v = Mt(v, e(S, g, a, c));
      }), !i && a.modularCssLayers ? {
        "@layer sx": en(a, rn(p, v))
      } : en(a, rn(p, v));
    }
    return Array.isArray(o) ? o.map(l) : l(o);
  }
  return r;
}
const yt = za();
yt.filterProps = ["sx"];
function Ba(e) {
  for (var r = 0, n, o = 0, a = e.length; a >= 4; ++o, a -= 4)
    n = e.charCodeAt(o) & 255 | (e.charCodeAt(++o) & 255) << 8 | (e.charCodeAt(++o) & 255) << 16 | (e.charCodeAt(++o) & 255) << 24, n = /* Math.imul(k, m): */
    (n & 65535) * 1540483477 + ((n >>> 16) * 59797 << 16), n ^= /* k >>> r: */
    n >>> 24, r = /* Math.imul(k, m): */
    (n & 65535) * 1540483477 + ((n >>> 16) * 59797 << 16) ^ /* Math.imul(h, m): */
    (r & 65535) * 1540483477 + ((r >>> 16) * 59797 << 16);
  switch (a) {
    case 3:
      r ^= (e.charCodeAt(o + 2) & 255) << 16;
    case 2:
      r ^= (e.charCodeAt(o + 1) & 255) << 8;
    case 1:
      r ^= e.charCodeAt(o) & 255, r = /* Math.imul(h, m): */
      (r & 65535) * 1540483477 + ((r >>> 16) * 59797 << 16);
  }
  return r ^= r >>> 13, r = /* Math.imul(h, m): */
  (r & 65535) * 1540483477 + ((r >>> 16) * 59797 << 16), ((r ^ r >>> 15) >>> 0).toString(36);
}
var Oa = {
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
function Ma(e) {
  var r = /* @__PURE__ */ Object.create(null);
  return function(n) {
    return r[n] === void 0 && (r[n] = e(n)), r[n];
  };
}
var La = /[A-Z]|^ms/g, Ra = /_EMO_([^_]+?)_([^]*?)_EMO_/g, Un = function(r) {
  return r.charCodeAt(1) === 45;
}, on = function(r) {
  return r != null && typeof r != "boolean";
}, br = /* @__PURE__ */ Ma(function(e) {
  return Un(e) ? e : e.replace(La, "-$&").toLowerCase();
}), an = function(r, n) {
  switch (r) {
    case "animation":
    case "animationName":
      if (typeof n == "string")
        return n.replace(Ra, function(o, a, i) {
          return We = {
            name: a,
            styles: i,
            next: We
          }, a;
        });
  }
  return Oa[r] !== 1 && !Un(r) && typeof n == "number" && n !== 0 ? n + "px" : n;
};
function Zt(e, r, n) {
  if (n == null)
    return "";
  var o = n;
  if (o.__emotion_styles !== void 0)
    return o;
  switch (typeof n) {
    case "boolean":
      return "";
    case "object": {
      var a = n;
      if (a.anim === 1)
        return We = {
          name: a.name,
          styles: a.styles,
          next: We
        }, a.name;
      var i = n;
      if (i.styles !== void 0) {
        var c = i.next;
        if (c !== void 0)
          for (; c !== void 0; )
            We = {
              name: c.name,
              styles: c.styles,
              next: We
            }, c = c.next;
        var l = i.styles + ";";
        return l;
      }
      return ja(e, r, n);
    }
  }
  var h = n;
  return h;
}
function ja(e, r, n) {
  var o = "";
  if (Array.isArray(n))
    for (var a = 0; a < n.length; a++)
      o += Zt(e, r, n[a]) + ";";
  else
    for (var i in n) {
      var c = n[i];
      if (typeof c != "object") {
        var l = c;
        on(l) && (o += br(i) + ":" + an(i, l) + ";");
      } else if (Array.isArray(c) && typeof c[0] == "string" && r == null)
        for (var h = 0; h < c.length; h++)
          on(c[h]) && (o += br(i) + ":" + an(i, c[h]) + ";");
      else {
        var u = Zt(e, r, c);
        switch (i) {
          case "animation":
          case "animationName": {
            o += br(i) + ":" + u + ";";
            break;
          }
          default:
            o += i + "{" + u + "}";
        }
      }
    }
  return o;
}
var sn = /label:\s*([^\s;{]+)\s*(;|$)/g, We;
function Wa(e, r, n) {
  if (e.length === 1 && typeof e[0] == "object" && e[0] !== null && e[0].styles !== void 0)
    return e[0];
  var o = !0, a = "";
  We = void 0;
  var i = e[0];
  if (i == null || i.raw === void 0)
    o = !1, a += Zt(n, r, i);
  else {
    var c = i;
    a += c[0];
  }
  for (var l = 1; l < e.length; l++)
    if (a += Zt(n, r, e[l]), o) {
      var h = i;
      a += h[l];
    }
  sn.lastIndex = 0;
  for (var u = "", m; (m = sn.exec(a)) !== null; )
    u += "-" + m[1];
  var p = Ba(a) + u;
  return {
    name: p,
    styles: a,
    next: We
  };
}
/**
 * @mui/styled-engine v7.3.5
 *
 * @license MIT
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
function Fa(e, r) {
  const n = Mo(e, r);
  return process.env.NODE_ENV !== "production" ? (...o) => {
    const a = typeof e == "string" ? `"${e}"` : "component";
    return o.length === 0 ? console.error([`MUI: Seems like you called \`styled(${a})()\` without a \`style\` argument.`, 'You must provide a `styles` argument: `styled("div")(styleYouForgotToPass)`.'].join(`
`)) : o.some((i) => i === void 0) && console.error(`MUI: the styled(${a})(...args) API requires all its args to be defined.`), n(...o);
  } : n;
}
function Ua(e, r) {
  Array.isArray(e.__emotion_styles) && (e.__emotion_styles = r(e.__emotion_styles));
}
const ln = [];
function et(e) {
  return ln[0] = e, Wa(ln);
}
const _a = (e) => {
  const r = Object.keys(e).map((n) => ({
    key: n,
    val: e[n]
  })) || [];
  return r.sort((n, o) => n.val - o.val), r.reduce((n, o) => ({
    ...n,
    [o.key]: o.val
  }), {});
};
function Va(e) {
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
    step: o = 5,
    ...a
  } = e, i = _a(r), c = Object.keys(i);
  function l(v) {
    return `@media (min-width:${typeof r[v] == "number" ? r[v] : v}${n})`;
  }
  function h(v) {
    return `@media (max-width:${(typeof r[v] == "number" ? r[v] : v) - o / 100}${n})`;
  }
  function u(v, S) {
    const g = c.indexOf(S);
    return `@media (min-width:${typeof r[v] == "number" ? r[v] : v}${n}) and (max-width:${(g !== -1 && typeof r[c[g]] == "number" ? r[c[g]] : S) - o / 100}${n})`;
  }
  function m(v) {
    return c.indexOf(v) + 1 < c.length ? u(v, c[c.indexOf(v) + 1]) : l(v);
  }
  function p(v) {
    const S = c.indexOf(v);
    return S === 0 ? l(c[1]) : S === c.length - 1 ? h(c[S]) : u(v, c[c.indexOf(v) + 1]).replace("@media", "@media not all and");
  }
  return {
    keys: c,
    values: i,
    up: l,
    down: h,
    between: u,
    only: m,
    not: p,
    unit: n,
    ...a
  };
}
const Ha = {
  borderRadius: 4
};
function _n(e = 8, r = Rr({
  spacing: e
})) {
  if (e.mui)
    return e;
  const n = (...o) => (process.env.NODE_ENV !== "production" && (o.length <= 4 || console.error(`MUI: Too many arguments provided, expected between 0 and 4, got ${o.length}`)), (o.length === 0 ? [1] : o).map((i) => {
    const c = r(i);
    return typeof c == "number" ? `${c}px` : c;
  }).join(" "));
  return n.mui = !0, n;
}
function Ka(e, r) {
  var o;
  const n = this;
  if (n.vars) {
    if (!((o = n.colorSchemes) != null && o[e]) || typeof n.getColorSchemeSelector != "function")
      return {};
    let a = n.getColorSchemeSelector(e);
    return a === "&" ? r : ((a.includes("data-") || a.includes(".")) && (a = `*:where(${a.replace(/\s*&$/, "")}) &`), {
      [a]: r
    });
  }
  return n.palette.mode === e ? r : {};
}
function Vn(e = {}, ...r) {
  const {
    breakpoints: n = {},
    palette: o = {},
    spacing: a,
    shape: i = {},
    ...c
  } = e, l = Va(n), h = _n(a);
  let u = Ie({
    breakpoints: l,
    direction: "ltr",
    components: {},
    // Inject component definitions.
    palette: {
      mode: "light",
      ...o
    },
    spacing: h,
    shape: {
      ...Ha,
      ...i
    }
  }, c);
  return u = Ho(u), u.applyStyles = Ka, u = r.reduce((m, p) => Ie(m, p), u), u.unstable_sxConfig = {
    ...ur,
    ...c == null ? void 0 : c.unstable_sxConfig
  }, u.unstable_sx = function(p) {
    return yt({
      sx: p,
      theme: this
    });
  }, u;
}
const Ga = {
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
  const o = Ga[r];
  return o ? `${n}-${o}` : `${Fo.generate(e)}-${r}`;
}
function qa(e, r, n = "Mui") {
  const o = {};
  return r.forEach((a) => {
    o[a] = Wr(e, a, n);
  }), o;
}
function Hn(e, r = "") {
  return e.displayName || e.name || r;
}
function cn(e, r, n) {
  const o = Hn(r);
  return e.displayName || (o !== "" ? `${n}(${o})` : n);
}
function Ja(e) {
  if (e != null) {
    if (typeof e == "string")
      return e;
    if (typeof e == "function")
      return Hn(e, "Component");
    if (typeof e == "object")
      switch (e.$$typeof) {
        case Ro:
          return cn(e, e.render, "ForwardRef");
        case Lo:
          return cn(e, e.type, "memo");
        default:
          return;
      }
  }
}
function Kn(e) {
  const {
    variants: r,
    ...n
  } = e, o = {
    variants: r,
    style: et(n),
    isProcessed: !0
  };
  return o.style === n || r && r.forEach((a) => {
    typeof a.style != "function" && (a.style = et(a.style));
  }), o;
}
const Qa = Vn();
function vr(e) {
  return e !== "ownerState" && e !== "theme" && e !== "sx" && e !== "as";
}
function Je(e, r) {
  return r && e && typeof e == "object" && e.styles && !e.styles.startsWith("@layer") && (e.styles = `@layer ${r}{${String(e.styles)}}`), e;
}
function Ya(e) {
  return e ? (r, n) => n[e] : null;
}
function Xa(e, r, n) {
  e.theme = ri(e.theme) ? n : e.theme[r] || e.theme;
}
function qt(e, r, n) {
  const o = typeof r == "function" ? r(e) : r;
  if (Array.isArray(o))
    return o.flatMap((a) => qt(e, a, n));
  if (Array.isArray(o == null ? void 0 : o.variants)) {
    let a;
    if (o.isProcessed)
      a = n ? Je(o.style, n) : o.style;
    else {
      const {
        variants: i,
        ...c
      } = o;
      a = n ? Je(et(c), n) : c;
    }
    return Gn(e, o.variants, [a], n);
  }
  return o != null && o.isProcessed ? n ? Je(et(o.style), n) : o.style : n ? Je(et(o), n) : o;
}
function Gn(e, r, n = [], o = void 0) {
  var i;
  let a;
  e: for (let c = 0; c < r.length; c += 1) {
    const l = r[c];
    if (typeof l.props == "function") {
      if (a ?? (a = {
        ...e,
        ...e.ownerState,
        ownerState: e.ownerState
      }), !l.props(a))
        continue;
    } else
      for (const h in l.props)
        if (e[h] !== l.props[h] && ((i = e.ownerState) == null ? void 0 : i[h]) !== l.props[h])
          continue e;
    typeof l.style == "function" ? (a ?? (a = {
      ...e,
      ...e.ownerState,
      ownerState: e.ownerState
    }), n.push(o ? Je(et(l.style(a)), o) : l.style(a))) : n.push(o ? Je(et(l.style), o) : l.style);
  }
  return n;
}
function Za(e = {}) {
  const {
    themeId: r,
    defaultTheme: n = Qa,
    rootShouldForwardProp: o = vr,
    slotShouldForwardProp: a = vr
  } = e;
  function i(l) {
    Xa(l, r, n);
  }
  return (l, h = {}) => {
    Ua(l, (T) => T.filter((V) => V !== yt));
    const {
      name: u,
      slot: m,
      skipVariantsResolver: p,
      skipSx: v,
      // TODO v6: remove `lowercaseFirstLetter()` in the next major release
      // For more details: https://github.com/mui/material-ui/pull/37908
      overridesResolver: S = Ya(qn(m)),
      ...g
    } = h, A = u && u.startsWith("Mui") || m ? "components" : "custom", $ = p !== void 0 ? p : (
      // TODO v6: remove `Root` in the next major release
      // For more details: https://github.com/mui/material-ui/pull/37908
      m && m !== "Root" && m !== "root" || !1
    ), B = v || !1;
    let O = vr;
    m === "Root" || m === "root" ? O = o : m ? O = a : ni(l) && (O = void 0);
    const E = Fa(l, {
      shouldForwardProp: O,
      label: ti(u, m),
      ...g
    }), b = (T) => {
      if (T.__emotion_real === T)
        return T;
      if (typeof T == "function")
        return function(U) {
          return qt(U, T, U.theme.modularCssLayers ? A : void 0);
        };
      if (Le(T)) {
        const V = Kn(T);
        return function(L) {
          return V.variants ? qt(L, V, L.theme.modularCssLayers ? A : void 0) : L.theme.modularCssLayers ? Je(V.style, A) : V.style;
        };
      }
      return T;
    }, N = (...T) => {
      const V = [], U = T.map(b), L = [];
      if (V.push(i), u && S && L.push(function(P) {
        var oe, H;
        const M = (H = (oe = P.theme.components) == null ? void 0 : oe[u]) == null ? void 0 : H.styleOverrides;
        if (!M)
          return null;
        const W = {};
        for (const pe in M)
          W[pe] = qt(P, M[pe], P.theme.modularCssLayers ? "theme" : void 0);
        return S(P, W);
      }), u && !$ && L.push(function(P) {
        var W, oe;
        const x = P.theme, M = (oe = (W = x == null ? void 0 : x.components) == null ? void 0 : W[u]) == null ? void 0 : oe.variants;
        return M ? Gn(P, M, [], P.theme.modularCssLayers ? "theme" : void 0) : null;
      }), B || L.push(yt), Array.isArray(U[0])) {
        const d = U.shift(), P = new Array(V.length).fill(""), x = new Array(L.length).fill("");
        let M;
        M = [...P, ...d, ...x], M.raw = [...P, ...d.raw, ...x], V.unshift(M);
      }
      const de = [...V, ...U, ...L], G = E(...de);
      return l.muiName && (G.muiName = l.muiName), process.env.NODE_ENV !== "production" && (G.displayName = ei(u, m, l)), G;
    };
    return E.withConfig && (N.withConfig = E.withConfig), N;
  };
}
function ei(e, r, n) {
  return e ? `${e}${tt(r || "")}` : `Styled(${Ja(n)})`;
}
function ti(e, r) {
  let n;
  return process.env.NODE_ENV !== "production" && e && (n = `${e}-${qn(r || "Root")}`), n;
}
function ri(e) {
  for (const r in e)
    return !1;
  return !0;
}
function ni(e) {
  return typeof e == "string" && // 96 is one less than the char code
  // for "a" so this is checking that
  // it's a lowercase character
  e.charCodeAt(0) > 96;
}
function qn(e) {
  return e && e.charAt(0).toLowerCase() + e.slice(1);
}
function Ir(e, r, n = !1) {
  const o = {
    ...r
  };
  for (const a in e)
    if (Object.prototype.hasOwnProperty.call(e, a)) {
      const i = a;
      if (i === "components" || i === "slots")
        o[i] = {
          ...e[i],
          ...o[i]
        };
      else if (i === "componentsProps" || i === "slotProps") {
        const c = e[i], l = r[i];
        if (!l)
          o[i] = c || {};
        else if (!c)
          o[i] = l;
        else {
          o[i] = {
            ...l
          };
          for (const h in c)
            if (Object.prototype.hasOwnProperty.call(c, h)) {
              const u = h;
              o[i][u] = Ir(c[u], l[u], n);
            }
        }
      } else i === "className" && n && r.className ? o.className = jn(e == null ? void 0 : e.className, r == null ? void 0 : r.className) : i === "style" && n && r.style ? o.style = {
        ...e == null ? void 0 : e.style,
        ...r == null ? void 0 : r.style
      } : o[i] === void 0 && (o[i] = e[i]);
    }
  return o;
}
function oi(e, r = Number.MIN_SAFE_INTEGER, n = Number.MAX_SAFE_INTEGER) {
  return Math.max(r, Math.min(e, n));
}
function Fr(e, r = 0, n = 1) {
  return process.env.NODE_ENV !== "production" && (e < r || e > n) && console.error(`MUI: The value provided ${e} is out of range [${r}, ${n}].`), oi(e, r, n);
}
function ai(e) {
  e = e.slice(1);
  const r = new RegExp(`.{1,${e.length >= 6 ? 2 : 1}}`, "g");
  let n = e.match(r);
  return n && n[0].length === 1 && (n = n.map((o) => o + o)), process.env.NODE_ENV !== "production" && e.length !== e.trim().length && console.error(`MUI: The color: "${e}" is invalid. Make sure the color input doesn't contain leading/trailing space.`), n ? `rgb${n.length === 4 ? "a" : ""}(${n.map((o, a) => a < 3 ? parseInt(o, 16) : Math.round(parseInt(o, 16) / 255 * 1e3) / 1e3).join(", ")})` : "";
}
function Ve(e) {
  if (e.type)
    return e;
  if (e.charAt(0) === "#")
    return Ve(ai(e));
  const r = e.indexOf("("), n = e.substring(0, r);
  if (!["rgb", "rgba", "hsl", "hsla", "color"].includes(n))
    throw new Error(process.env.NODE_ENV !== "production" ? `MUI: Unsupported \`${e}\` color.
The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().` : _e(9, e));
  let o = e.substring(r + 1, e.length - 1), a;
  if (n === "color") {
    if (o = o.split(" "), a = o.shift(), o.length === 4 && o[3].charAt(0) === "/" && (o[3] = o[3].slice(1)), !["srgb", "display-p3", "a98-rgb", "prophoto-rgb", "rec-2020"].includes(a))
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: unsupported \`${a}\` color space.
The following color spaces are supported: srgb, display-p3, a98-rgb, prophoto-rgb, rec-2020.` : _e(10, a));
  } else
    o = o.split(",");
  return o = o.map((i) => parseFloat(i)), {
    type: n,
    values: o,
    colorSpace: a
  };
}
const ii = (e) => {
  const r = Ve(e);
  return r.values.slice(0, 3).map((n, o) => r.type.includes("hsl") && o !== 0 ? `${n}%` : n).join(" ");
}, Bt = (e, r) => {
  try {
    return ii(e);
  } catch {
    return r && process.env.NODE_ENV !== "production" && console.warn(r), e;
  }
};
function mr(e) {
  const {
    type: r,
    colorSpace: n
  } = e;
  let {
    values: o
  } = e;
  return r.includes("rgb") ? o = o.map((a, i) => i < 3 ? parseInt(a, 10) : a) : r.includes("hsl") && (o[1] = `${o[1]}%`, o[2] = `${o[2]}%`), r.includes("color") ? o = `${n} ${o.join(" ")}` : o = `${o.join(", ")}`, `${r}(${o})`;
}
function Jn(e) {
  e = Ve(e);
  const {
    values: r
  } = e, n = r[0], o = r[1] / 100, a = r[2] / 100, i = o * Math.min(a, 1 - a), c = (u, m = (u + n / 30) % 12) => a - i * Math.max(Math.min(m - 3, 9 - m, 1), -1);
  let l = "rgb";
  const h = [Math.round(c(0) * 255), Math.round(c(8) * 255), Math.round(c(4) * 255)];
  return e.type === "hsla" && (l += "a", h.push(r[3])), mr({
    type: l,
    values: h
  });
}
function $r(e) {
  e = Ve(e);
  let r = e.type === "hsl" || e.type === "hsla" ? Ve(Jn(e)).values : e.values;
  return r = r.map((n) => (e.type !== "color" && (n /= 255), n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4)), Number((0.2126 * r[0] + 0.7152 * r[1] + 0.0722 * r[2]).toFixed(3));
}
function dn(e, r) {
  const n = $r(e), o = $r(r);
  return (Math.max(n, o) + 0.05) / (Math.min(n, o) + 0.05);
}
function Qn(e, r) {
  return e = Ve(e), r = Fr(r), (e.type === "rgb" || e.type === "hsl") && (e.type += "a"), e.type === "color" ? e.values[3] = `/${r}` : e.values[3] = r, mr(e);
}
function qe(e, r, n) {
  try {
    return Qn(e, r);
  } catch {
    return n && process.env.NODE_ENV !== "production" && console.warn(n), e;
  }
}
function fr(e, r) {
  if (e = Ve(e), r = Fr(r), e.type.includes("hsl"))
    e.values[2] *= 1 - r;
  else if (e.type.includes("rgb") || e.type.includes("color"))
    for (let n = 0; n < 3; n += 1)
      e.values[n] *= 1 - r;
  return mr(e);
}
function Z(e, r, n) {
  try {
    return fr(e, r);
  } catch {
    return n && process.env.NODE_ENV !== "production" && console.warn(n), e;
  }
}
function pr(e, r) {
  if (e = Ve(e), r = Fr(r), e.type.includes("hsl"))
    e.values[2] += (100 - e.values[2]) * r;
  else if (e.type.includes("rgb"))
    for (let n = 0; n < 3; n += 1)
      e.values[n] += (255 - e.values[n]) * r;
  else if (e.type.includes("color"))
    for (let n = 0; n < 3; n += 1)
      e.values[n] += (1 - e.values[n]) * r;
  return mr(e);
}
function ee(e, r, n) {
  try {
    return pr(e, r);
  } catch {
    return n && process.env.NODE_ENV !== "production" && console.warn(n), e;
  }
}
function si(e, r = 0.15) {
  return $r(e) > 0.5 ? fr(e, r) : pr(e, r);
}
function Kt(e, r, n) {
  try {
    return si(e, r);
  } catch {
    return e;
  }
}
const li = /* @__PURE__ */ Ue.createContext(void 0);
process.env.NODE_ENV !== "production" && (X.node, X.object);
function ci(e) {
  const {
    theme: r,
    name: n,
    props: o
  } = e;
  if (!r || !r.components || !r.components[n])
    return o;
  const a = r.components[n];
  return a.defaultProps ? Ir(a.defaultProps, o, r.components.mergeClassNameAndStyle) : !a.styleOverrides && !a.variants ? Ir(a, o, r.components.mergeClassNameAndStyle) : o;
}
function di({
  props: e,
  name: r
}) {
  const n = Ue.useContext(li);
  return ci({
    props: e,
    name: r,
    theme: {
      components: n
    }
  });
}
const hn = {
  theme: void 0
};
function hi(e) {
  let r, n;
  return function(a) {
    let i = r;
    return (i === void 0 || a.theme !== n) && (hn.theme = a.theme, i = Kn(e(hn)), r = i, n = a.theme), i;
  };
}
function ui(e = "") {
  function r(...o) {
    if (!o.length)
      return "";
    const a = o[0];
    return typeof a == "string" && !a.match(/(#|\(|\)|(-?(\d*\.)?\d+)(px|em|%|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc))|^(-?(\d*\.)?\d+)$|(\d+ \d+ \d+)/) ? `, var(--${e ? `${e}-` : ""}${a}${r(...o.slice(1))})` : `, ${a}`;
  }
  return (o, ...a) => `var(--${e ? `${e}-` : ""}${o}${r(...a)})`;
}
const un = (e, r, n, o = []) => {
  let a = e;
  r.forEach((i, c) => {
    c === r.length - 1 ? Array.isArray(a) ? a[Number(i)] = n : a && typeof a == "object" && (a[i] = n) : a && typeof a == "object" && (a[i] || (a[i] = o.includes(i) ? [] : {}), a = a[i]);
  });
}, mi = (e, r, n) => {
  function o(a, i = [], c = []) {
    Object.entries(a).forEach(([l, h]) => {
      (!n || n && !n([...i, l])) && h != null && (typeof h == "object" && Object.keys(h).length > 0 ? o(h, [...i, l], Array.isArray(h) ? [...c, l] : c) : r([...i, l], h, c));
    });
  }
  o(e);
}, fi = (e, r) => typeof r == "number" ? ["lineHeight", "fontWeight", "opacity", "zIndex"].some((o) => e.includes(o)) || e[e.length - 1].toLowerCase().includes("opacity") ? r : `${r}px` : r;
function xr(e, r) {
  const {
    prefix: n,
    shouldSkipGeneratingVar: o
  } = r || {}, a = {}, i = {}, c = {};
  return mi(
    e,
    (l, h, u) => {
      if ((typeof h == "string" || typeof h == "number") && (!o || !o(l, h))) {
        const m = `--${n ? `${n}-` : ""}${l.join("-")}`, p = fi(l, h);
        Object.assign(a, {
          [m]: p
        }), un(i, l, `var(${m})`, u), un(c, l, `var(${m}, ${p})`, u);
      }
    },
    (l) => l[0] === "vars"
    // skip 'vars/*' paths
  ), {
    css: a,
    vars: i,
    varsWithDefaults: c
  };
}
function pi(e, r = {}) {
  const {
    getSelector: n = B,
    disableCssColorScheme: o,
    colorSchemeSelector: a,
    enableContrastVars: i
  } = r, {
    colorSchemes: c = {},
    components: l,
    defaultColorScheme: h = "light",
    ...u
  } = e, {
    vars: m,
    css: p,
    varsWithDefaults: v
  } = xr(u, r);
  let S = v;
  const g = {}, {
    [h]: A,
    ...$
  } = c;
  if (Object.entries($ || {}).forEach(([b, N]) => {
    const {
      vars: T,
      css: V,
      varsWithDefaults: U
    } = xr(N, r);
    S = Ie(S, U), g[b] = {
      css: V,
      vars: T
    };
  }), A) {
    const {
      css: b,
      vars: N,
      varsWithDefaults: T
    } = xr(A, r);
    S = Ie(S, T), g[h] = {
      css: b,
      vars: N
    };
  }
  function B(b, N) {
    var V, U;
    let T = a;
    if (a === "class" && (T = ".%s"), a === "data" && (T = "[data-%s]"), a != null && a.startsWith("data-") && !a.includes("%s") && (T = `[${a}="%s"]`), b) {
      if (T === "media")
        return e.defaultColorScheme === b ? ":root" : {
          [`@media (prefers-color-scheme: ${((U = (V = c[b]) == null ? void 0 : V.palette) == null ? void 0 : U.mode) || b})`]: {
            ":root": N
          }
        };
      if (T)
        return e.defaultColorScheme === b ? `:root, ${T.replace("%s", String(b))}` : T.replace("%s", String(b));
    }
    return ":root";
  }
  return {
    vars: S,
    generateThemeVars: () => {
      let b = {
        ...m
      };
      return Object.entries(g).forEach(([, {
        vars: N
      }]) => {
        b = Ie(b, N);
      }), b;
    },
    generateStyleSheets: () => {
      var L, de;
      const b = [], N = e.defaultColorScheme || "light";
      function T(G, d) {
        Object.keys(d).length && b.push(typeof G == "string" ? {
          [G]: {
            ...d
          }
        } : G);
      }
      T(n(void 0, {
        ...p
      }), p);
      const {
        [N]: V,
        ...U
      } = g;
      if (V) {
        const {
          css: G
        } = V, d = (de = (L = c[N]) == null ? void 0 : L.palette) == null ? void 0 : de.mode, P = !o && d ? {
          colorScheme: d,
          ...G
        } : {
          ...G
        };
        T(n(N, {
          ...P
        }), P);
      }
      return Object.entries(U).forEach(([G, {
        css: d
      }]) => {
        var M, W;
        const P = (W = (M = c[G]) == null ? void 0 : M.palette) == null ? void 0 : W.mode, x = !o && P ? {
          colorScheme: P,
          ...d
        } : {
          ...d
        };
        T(n(G, {
          ...x
        }), x);
      }), i && b.push({
        ":root": {
          // use double underscore to indicate that these are private variables
          "--__l-threshold": "0.7",
          "--__l": "clamp(0, (l / var(--__l-threshold) - 1) * -infinity, 1)",
          "--__a": "clamp(0.87, (l / var(--__l-threshold) - 1) * -infinity, 1)"
          // 0.87 is the default alpha value for black text.
        }
      }), b;
    }
  };
}
function gi(e) {
  return function(n) {
    return e === "media" ? (process.env.NODE_ENV !== "production" && n !== "light" && n !== "dark" && console.error(`MUI: @media (prefers-color-scheme) supports only 'light' or 'dark', but receive '${n}'.`), `@media (prefers-color-scheme: ${n})`) : e ? e.startsWith("data-") && !e.includes("%s") ? `[${e}="${n}"] &` : e === "class" ? `.${n} &` : e === "data" ? `[data-${n}] &` : `${e.replace("%s", n)} &` : "&";
  };
}
const Rt = {
  black: "#000",
  white: "#fff"
}, yi = {
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
}, st = {
  50: "#f3e5f5",
  200: "#ce93d8",
  300: "#ba68c8",
  400: "#ab47bc",
  500: "#9c27b0",
  700: "#7b1fa2"
}, lt = {
  300: "#e57373",
  400: "#ef5350",
  500: "#f44336",
  700: "#d32f2f",
  800: "#c62828"
}, Nt = {
  300: "#ffb74d",
  400: "#ffa726",
  500: "#ff9800",
  700: "#f57c00",
  900: "#e65100"
}, ct = {
  50: "#e3f2fd",
  200: "#90caf9",
  400: "#42a5f5",
  700: "#1976d2",
  800: "#1565c0"
}, dt = {
  300: "#4fc3f7",
  400: "#29b6f6",
  500: "#03a9f4",
  700: "#0288d1",
  900: "#01579b"
}, ht = {
  300: "#81c784",
  400: "#66bb6a",
  500: "#4caf50",
  700: "#388e3c",
  800: "#2e7d32",
  900: "#1b5e20"
};
function Yn() {
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
      paper: Rt.white,
      default: Rt.white
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
const Xn = Yn();
function Zn() {
  return {
    text: {
      primary: Rt.white,
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
      active: Rt.white,
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
const Ar = Zn();
function mn(e, r, n, o) {
  const a = o.light || o, i = o.dark || o * 1.5;
  e[r] || (e.hasOwnProperty(n) ? e[r] = e[n] : r === "light" ? e.light = pr(e.main, a) : r === "dark" && (e.dark = fr(e.main, i)));
}
function fn(e, r, n, o, a) {
  const i = a.light || a, c = a.dark || a * 1.5;
  r[n] || (r.hasOwnProperty(o) ? r[n] = r[o] : n === "light" ? r.light = `color-mix(in ${e}, ${r.main}, #fff ${(i * 100).toFixed(0)}%)` : n === "dark" && (r.dark = `color-mix(in ${e}, ${r.main}, #000 ${(c * 100).toFixed(0)}%)`));
}
function bi(e = "light") {
  return e === "dark" ? {
    main: ct[200],
    light: ct[50],
    dark: ct[400]
  } : {
    main: ct[700],
    light: ct[400],
    dark: ct[800]
  };
}
function vi(e = "light") {
  return e === "dark" ? {
    main: st[200],
    light: st[50],
    dark: st[400]
  } : {
    main: st[500],
    light: st[300],
    dark: st[700]
  };
}
function xi(e = "light") {
  return e === "dark" ? {
    main: lt[500],
    light: lt[300],
    dark: lt[700]
  } : {
    main: lt[700],
    light: lt[400],
    dark: lt[800]
  };
}
function Ci(e = "light") {
  return e === "dark" ? {
    main: dt[400],
    light: dt[300],
    dark: dt[700]
  } : {
    main: dt[700],
    light: dt[500],
    dark: dt[900]
  };
}
function wi(e = "light") {
  return e === "dark" ? {
    main: ht[400],
    light: ht[300],
    dark: ht[700]
  } : {
    main: ht[800],
    light: ht[500],
    dark: ht[900]
  };
}
function Si(e = "light") {
  return e === "dark" ? {
    main: Nt[400],
    light: Nt[300],
    dark: Nt[700]
  } : {
    main: "#ed6c02",
    // closest to orange[800] that pass 3:1.
    light: Nt[500],
    dark: Nt[900]
  };
}
function ki(e) {
  return `oklch(from ${e} var(--__l) 0 h / var(--__a))`;
}
function Ur(e) {
  const {
    mode: r = "light",
    contrastThreshold: n = 3,
    tonalOffset: o = 0.2,
    colorSpace: a,
    ...i
  } = e, c = e.primary || bi(r), l = e.secondary || vi(r), h = e.error || xi(r), u = e.info || Ci(r), m = e.success || wi(r), p = e.warning || Si(r);
  function v($) {
    if (a)
      return ki($);
    const B = dn($, Ar.text.primary) >= n ? Ar.text.primary : Xn.text.primary;
    if (process.env.NODE_ENV !== "production") {
      const O = dn($, B);
      O < 3 && console.error([`MUI: The contrast ratio of ${O}:1 for ${B} on ${$}`, "falls below the WCAG recommended absolute minimum contrast ratio of 3:1.", "https://www.w3.org/TR/2008/REC-WCAG20-20081211/#visual-audio-contrast-contrast"].join(`
`));
    }
    return B;
  }
  const S = ({
    color: $,
    name: B,
    mainShade: O = 500,
    lightShade: E = 300,
    darkShade: b = 700
  }) => {
    if ($ = {
      ...$
    }, !$.main && $[O] && ($.main = $[O]), !$.hasOwnProperty("main"))
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The color${B ? ` (${B})` : ""} provided to augmentColor(color) is invalid.
The color object needs to have a \`main\` property or a \`${O}\` property.` : _e(11, B ? ` (${B})` : "", O));
    if (typeof $.main != "string")
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The color${B ? ` (${B})` : ""} provided to augmentColor(color) is invalid.
\`color.main\` should be a string, but \`${JSON.stringify($.main)}\` was provided instead.

Did you intend to use one of the following approaches?

import { green } from "@mui/material/colors";

const theme1 = createTheme({ palette: {
  primary: green,
} });

const theme2 = createTheme({ palette: {
  primary: { main: green[500] },
} });` : _e(12, B ? ` (${B})` : "", JSON.stringify($.main)));
    return a ? (fn(a, $, "light", E, o), fn(a, $, "dark", b, o)) : (mn($, "light", E, o), mn($, "dark", b, o)), $.contrastText || ($.contrastText = v($.main)), $;
  };
  let g;
  return r === "light" ? g = Yn() : r === "dark" && (g = Zn()), process.env.NODE_ENV !== "production" && (g || console.error(`MUI: The palette mode \`${r}\` is not supported.`)), Ie({
    // A collection of common colors.
    common: {
      ...Rt
    },
    // prevent mutable object.
    // The palette mode, can be light or dark.
    mode: r,
    // The colors used to represent primary interface elements for a user.
    primary: S({
      color: c,
      name: "primary"
    }),
    // The colors used to represent secondary interface elements for a user.
    secondary: S({
      color: l,
      name: "secondary",
      mainShade: "A400",
      lightShade: "A200",
      darkShade: "A700"
    }),
    // The colors used to represent interface elements that the user should be made aware of.
    error: S({
      color: h,
      name: "error"
    }),
    // The colors used to represent potentially dangerous actions or important messages.
    warning: S({
      color: p,
      name: "warning"
    }),
    // The colors used to present information to the user that is neutral and not necessarily important.
    info: S({
      color: u,
      name: "info"
    }),
    // The colors used to indicate the successful completion of an action that user triggered.
    success: S({
      color: m,
      name: "success"
    }),
    // The grey colors.
    grey: yi,
    // Used by `getContrastText()` to maximize the contrast between
    // the background and the text.
    contrastThreshold: n,
    // Takes a background color and returns the text color that maximizes the contrast.
    getContrastText: v,
    // Generate a rich color object.
    augmentColor: S,
    // Used by the functions below to shift a color's luminance by approximately
    // two indexes within its tonal palette.
    // E.g., shift from Red 500 to Red 300 or Red 700.
    tonalOffset: o,
    // The light and dark mode object.
    ...g
  }, i);
}
function Ei(e) {
  const r = {};
  return Object.entries(e).forEach((o) => {
    const [a, i] = o;
    typeof i == "object" && (r[a] = `${i.fontStyle ? `${i.fontStyle} ` : ""}${i.fontVariant ? `${i.fontVariant} ` : ""}${i.fontWeight ? `${i.fontWeight} ` : ""}${i.fontStretch ? `${i.fontStretch} ` : ""}${i.fontSize || ""}${i.lineHeight ? `/${i.lineHeight} ` : ""}${i.fontFamily || ""}`);
  }), r;
}
function Ii(e, r) {
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
function $i(e) {
  return Math.round(e * 1e5) / 1e5;
}
const pn = {
  textTransform: "uppercase"
}, gn = '"Roboto", "Helvetica", "Arial", sans-serif';
function Ai(e, r) {
  const {
    fontFamily: n = gn,
    // The default font size of the Material Specification.
    fontSize: o = 14,
    // px
    fontWeightLight: a = 300,
    fontWeightRegular: i = 400,
    fontWeightMedium: c = 500,
    fontWeightBold: l = 700,
    // Tell MUI what's the font-size on the html element.
    // 16px is the default font-size used by browsers.
    htmlFontSize: h = 16,
    // Apply the CSS properties to all the variants.
    allVariants: u,
    pxToRem: m,
    ...p
  } = typeof r == "function" ? r(e) : r;
  process.env.NODE_ENV !== "production" && (typeof o != "number" && console.error("MUI: `fontSize` is required to be a number."), typeof h != "number" && console.error("MUI: `htmlFontSize` is required to be a number."));
  const v = o / 14, S = m || (($) => `${$ / h * v}rem`), g = ($, B, O, E, b) => ({
    fontFamily: n,
    fontWeight: $,
    fontSize: S(B),
    // Unitless following https://meyerweb.com/eric/thoughts/2006/02/08/unitless-line-heights/
    lineHeight: O,
    // The letter spacing was designed for the Roboto font-family. Using the same letter-spacing
    // across font-families can cause issues with the kerning.
    ...n === gn ? {
      letterSpacing: `${$i(E / B)}em`
    } : {},
    ...b,
    ...u
  }), A = {
    h1: g(a, 96, 1.167, -1.5),
    h2: g(a, 60, 1.2, -0.5),
    h3: g(i, 48, 1.167, 0),
    h4: g(i, 34, 1.235, 0.25),
    h5: g(i, 24, 1.334, 0),
    h6: g(c, 20, 1.6, 0.15),
    subtitle1: g(i, 16, 1.75, 0.15),
    subtitle2: g(c, 14, 1.57, 0.1),
    body1: g(i, 16, 1.5, 0.15),
    body2: g(i, 14, 1.43, 0.15),
    button: g(c, 14, 1.75, 0.4, pn),
    caption: g(i, 12, 1.66, 0.4),
    overline: g(i, 12, 2.66, 1, pn),
    // TODO v6: Remove handling of 'inherit' variant from the theme as it is already handled in Material UI's Typography component. Also, remember to remove the associated types.
    inherit: {
      fontFamily: "inherit",
      fontWeight: "inherit",
      fontSize: "inherit",
      lineHeight: "inherit",
      letterSpacing: "inherit"
    }
  };
  return Ie({
    htmlFontSize: h,
    pxToRem: S,
    fontFamily: n,
    fontSize: o,
    fontWeightLight: a,
    fontWeightRegular: i,
    fontWeightMedium: c,
    fontWeightBold: l,
    ...A
  }, p, {
    clone: !1
    // No need to clone deep
  });
}
const Ti = 0.2, Pi = 0.14, Ni = 0.12;
function ae(...e) {
  return [`${e[0]}px ${e[1]}px ${e[2]}px ${e[3]}px rgba(0,0,0,${Ti})`, `${e[4]}px ${e[5]}px ${e[6]}px ${e[7]}px rgba(0,0,0,${Pi})`, `${e[8]}px ${e[9]}px ${e[10]}px ${e[11]}px rgba(0,0,0,${Ni})`].join(",");
}
const Di = ["none", ae(0, 2, 1, -1, 0, 1, 1, 0, 0, 1, 3, 0), ae(0, 3, 1, -2, 0, 2, 2, 0, 0, 1, 5, 0), ae(0, 3, 3, -2, 0, 3, 4, 0, 0, 1, 8, 0), ae(0, 2, 4, -1, 0, 4, 5, 0, 0, 1, 10, 0), ae(0, 3, 5, -1, 0, 5, 8, 0, 0, 1, 14, 0), ae(0, 3, 5, -1, 0, 6, 10, 0, 0, 1, 18, 0), ae(0, 4, 5, -2, 0, 7, 10, 1, 0, 2, 16, 1), ae(0, 5, 5, -3, 0, 8, 10, 1, 0, 3, 14, 2), ae(0, 5, 6, -3, 0, 9, 12, 1, 0, 3, 16, 2), ae(0, 6, 6, -3, 0, 10, 14, 1, 0, 4, 18, 3), ae(0, 6, 7, -4, 0, 11, 15, 1, 0, 4, 20, 3), ae(0, 7, 8, -4, 0, 12, 17, 2, 0, 5, 22, 4), ae(0, 7, 8, -4, 0, 13, 19, 2, 0, 5, 24, 4), ae(0, 7, 9, -4, 0, 14, 21, 2, 0, 5, 26, 4), ae(0, 8, 9, -5, 0, 15, 22, 2, 0, 6, 28, 5), ae(0, 8, 10, -5, 0, 16, 24, 2, 0, 6, 30, 5), ae(0, 8, 11, -5, 0, 17, 26, 2, 0, 6, 32, 5), ae(0, 9, 11, -5, 0, 18, 28, 2, 0, 7, 34, 6), ae(0, 9, 12, -6, 0, 19, 29, 2, 0, 7, 36, 6), ae(0, 10, 13, -6, 0, 20, 31, 3, 0, 8, 38, 7), ae(0, 10, 13, -6, 0, 21, 33, 3, 0, 8, 40, 7), ae(0, 10, 14, -6, 0, 22, 35, 3, 0, 8, 42, 7), ae(0, 11, 14, -7, 0, 23, 36, 3, 0, 9, 44, 8), ae(0, 11, 15, -7, 0, 24, 38, 3, 0, 9, 46, 8)], zi = {
  // This is the most common easing curve.
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  // Objects enter the screen at full velocity from off-screen and
  // slowly decelerate to a resting point.
  easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
  // Objects leave the screen at full velocity. They do not decelerate when off-screen.
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  // The sharp curve is used by objects that may return to the screen at any time.
  sharp: "cubic-bezier(0.4, 0, 0.6, 1)"
}, Bi = {
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
function yn(e) {
  return `${Math.round(e)}ms`;
}
function Oi(e) {
  if (!e)
    return 0;
  const r = e / 36;
  return Math.min(Math.round((4 + 15 * r ** 0.25 + r / 5) * 10), 3e3);
}
function Mi(e) {
  const r = {
    ...zi,
    ...e.easing
  }, n = {
    ...Bi,
    ...e.duration
  };
  return {
    getAutoHeightDuration: Oi,
    create: (a = ["all"], i = {}) => {
      const {
        duration: c = n.standard,
        easing: l = r.easeInOut,
        delay: h = 0,
        ...u
      } = i;
      if (process.env.NODE_ENV !== "production") {
        const m = (v) => typeof v == "string", p = (v) => !Number.isNaN(parseFloat(v));
        !m(a) && !Array.isArray(a) && console.error('MUI: Argument "props" must be a string or Array.'), !p(c) && !m(c) && console.error(`MUI: Argument "duration" must be a number or a string but found ${c}.`), m(l) || console.error('MUI: Argument "easing" must be a string.'), !p(h) && !m(h) && console.error('MUI: Argument "delay" must be a number or a string.'), typeof i != "object" && console.error(["MUI: Secong argument of transition.create must be an object.", "Arguments should be either `create('prop1', options)` or `create(['prop1', 'prop2'], options)`"].join(`
`)), Object.keys(u).length !== 0 && console.error(`MUI: Unrecognized argument(s) [${Object.keys(u).join(",")}].`);
      }
      return (Array.isArray(a) ? a : [a]).map((m) => `${m} ${typeof c == "string" ? c : yn(c)} ${l} ${typeof h == "string" ? h : yn(h)}`).join(",");
    },
    ...e,
    easing: r,
    duration: n
  };
}
const Li = {
  mobileStepper: 1e3,
  fab: 1050,
  speedDial: 1050,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500
};
function Ri(e) {
  return Le(e) || typeof e > "u" || typeof e == "string" || typeof e == "boolean" || typeof e == "number" || Array.isArray(e);
}
function eo(e = {}) {
  const r = {
    ...e
  };
  function n(o) {
    const a = Object.entries(o);
    for (let i = 0; i < a.length; i++) {
      const [c, l] = a[i];
      !Ri(l) || c.startsWith("unstable_") ? delete o[c] : Le(l) && (o[c] = {
        ...l
      }, n(o[c]));
    }
  }
  return n(r), `import { unstable_createBreakpoints as createBreakpoints, createTransitions } from '@mui/material/styles';

const theme = ${JSON.stringify(r, null, 2)};

theme.breakpoints = createBreakpoints(theme.breakpoints || {});
theme.transitions = createTransitions(theme.transitions || {});

export default theme;`;
}
function bn(e) {
  return typeof e == "number" ? `${(e * 100).toFixed(0)}%` : `calc((${e}) * 100%)`;
}
const ji = (e) => {
  if (!Number.isNaN(+e))
    return +e;
  const r = e.match(/\d*\.?\d+/g);
  if (!r)
    return 0;
  let n = 0;
  for (let o = 0; o < r.length; o += 1)
    n += +r[o];
  return n;
};
function Wi(e) {
  Object.assign(e, {
    alpha(r, n) {
      const o = this || e;
      return o.colorSpace ? `oklch(from ${r} l c h / ${typeof n == "string" ? `calc(${n})` : n})` : o.vars ? `rgba(${r.replace(/var\(--([^,\s)]+)(?:,[^)]+)?\)+/g, "var(--$1Channel)")} / ${typeof n == "string" ? `calc(${n})` : n})` : Qn(r, ji(n));
    },
    lighten(r, n) {
      const o = this || e;
      return o.colorSpace ? `color-mix(in ${o.colorSpace}, ${r}, #fff ${bn(n)})` : pr(r, n);
    },
    darken(r, n) {
      const o = this || e;
      return o.colorSpace ? `color-mix(in ${o.colorSpace}, ${r}, #000 ${bn(n)})` : fr(r, n);
    }
  });
}
function Tr(e = {}, ...r) {
  const {
    breakpoints: n,
    mixins: o = {},
    spacing: a,
    palette: i = {},
    transitions: c = {},
    typography: l = {},
    shape: h,
    colorSpace: u,
    ...m
  } = e;
  if (e.vars && // The error should throw only for the root theme creation because user is not allowed to use a custom node `vars`.
  // `generateThemeVars` is the closest identifier for checking that the `options` is a result of `createTheme` with CSS variables so that user can create new theme for nested ThemeProvider.
  e.generateThemeVars === void 0)
    throw new Error(process.env.NODE_ENV !== "production" ? "MUI: `vars` is a private field used for CSS variables support.\nPlease use another name or follow the [docs](https://mui.com/material-ui/customization/css-theme-variables/usage/) to enable the feature." : _e(20));
  const p = Ur({
    ...i,
    colorSpace: u
  }), v = Vn(e);
  let S = Ie(v, {
    mixins: Ii(v.breakpoints, o),
    palette: p,
    // Don't use [...shadows] until you've verified its transpiled code is not invoking the iterator protocol.
    shadows: Di.slice(),
    typography: Ai(p, l),
    transitions: Mi(c),
    zIndex: {
      ...Li
    }
  });
  if (S = Ie(S, m), S = r.reduce((g, A) => Ie(g, A), S), process.env.NODE_ENV !== "production") {
    const g = ["active", "checked", "completed", "disabled", "error", "expanded", "focused", "focusVisible", "required", "selected"], A = ($, B) => {
      let O;
      for (O in $) {
        const E = $[O];
        if (g.includes(O) && Object.keys(E).length > 0) {
          if (process.env.NODE_ENV !== "production") {
            const b = Wr("", O);
            console.error([`MUI: The \`${B}\` component increases the CSS specificity of the \`${O}\` internal state.`, "You can not override it like this: ", JSON.stringify($, null, 2), "", `Instead, you need to use the '&.${b}' syntax:`, JSON.stringify({
              root: {
                [`&.${b}`]: E
              }
            }, null, 2), "", "https://mui.com/r/state-classes-guide"].join(`
`));
          }
          $[O] = {};
        }
      }
    };
    Object.keys(S.components).forEach(($) => {
      const B = S.components[$].styleOverrides;
      B && $.startsWith("Mui") && A(B, $);
    });
  }
  return S.unstable_sxConfig = {
    ...ur,
    ...m == null ? void 0 : m.unstable_sxConfig
  }, S.unstable_sx = function(A) {
    return yt({
      sx: A,
      theme: this
    });
  }, S.toRuntimeSource = eo, Wi(S), S;
}
function Fi(e) {
  let r;
  return e < 1 ? r = 5.11916 * e ** 2 : r = 4.5 * Math.log(e + 1) + 2, Math.round(r * 10) / 1e3;
}
const Ui = [...Array(25)].map((e, r) => {
  if (r === 0)
    return "none";
  const n = Fi(r);
  return `linear-gradient(rgba(255 255 255 / ${n}), rgba(255 255 255 / ${n}))`;
});
function to(e) {
  return {
    inputPlaceholder: e === "dark" ? 0.5 : 0.42,
    inputUnderline: e === "dark" ? 0.7 : 0.42,
    switchTrackDisabled: e === "dark" ? 0.2 : 0.12,
    switchTrack: e === "dark" ? 0.3 : 0.38
  };
}
function ro(e) {
  return e === "dark" ? Ui : [];
}
function _i(e) {
  const {
    palette: r = {
      mode: "light"
    },
    // need to cast to avoid module augmentation test
    opacity: n,
    overlays: o,
    colorSpace: a,
    ...i
  } = e, c = Ur({
    ...r,
    colorSpace: a
  });
  return {
    palette: c,
    opacity: {
      ...to(c.mode),
      ...n
    },
    overlays: o || ro(c.mode),
    ...i
  };
}
function Vi(e) {
  var r;
  return !!e[0].match(/(cssVarPrefix|colorSchemeSelector|modularCssLayers|rootSelector|typography|mixins|breakpoints|direction|transitions)/) || !!e[0].match(/sxConfig$/) || // ends with sxConfig
  e[0] === "palette" && !!((r = e[1]) != null && r.match(/(mode|contrastThreshold|tonalOffset)/));
}
const Hi = (e) => [...[...Array(25)].map((r, n) => `--${e ? `${e}-` : ""}overlays-${n}`), `--${e ? `${e}-` : ""}palette-AppBar-darkBg`, `--${e ? `${e}-` : ""}palette-AppBar-darkColor`], Ki = (e) => (r, n) => {
  const o = e.rootSelector || ":root", a = e.colorSchemeSelector;
  let i = a;
  if (a === "class" && (i = ".%s"), a === "data" && (i = "[data-%s]"), a != null && a.startsWith("data-") && !a.includes("%s") && (i = `[${a}="%s"]`), e.defaultColorScheme === r) {
    if (r === "dark") {
      const c = {};
      return Hi(e.cssVarPrefix).forEach((l) => {
        c[l] = n[l], delete n[l];
      }), i === "media" ? {
        [o]: n,
        "@media (prefers-color-scheme: dark)": {
          [o]: c
        }
      } : i ? {
        [i.replace("%s", r)]: c,
        [`${o}, ${i.replace("%s", r)}`]: n
      } : {
        [o]: {
          ...n,
          ...c
        }
      };
    }
    if (i && i !== "media")
      return `${o}, ${i.replace("%s", String(r))}`;
  } else if (r) {
    if (i === "media")
      return {
        [`@media (prefers-color-scheme: ${String(r)})`]: {
          [o]: n
        }
      };
    if (i)
      return i.replace("%s", String(r));
  }
  return o;
};
function Gi(e, r) {
  r.forEach((n) => {
    e[n] || (e[n] = {});
  });
}
function C(e, r, n) {
  !e[r] && n && (e[r] = n);
}
function Ot(e) {
  return typeof e != "string" || !e.startsWith("hsl") ? e : Jn(e);
}
function Me(e, r) {
  `${r}Channel` in e || (e[`${r}Channel`] = Bt(Ot(e[r]), `MUI: Can't create \`palette.${r}Channel\` because \`palette.${r}\` is not one of these formats: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().
To suppress this warning, you need to explicitly provide the \`palette.${r}Channel\` as a string (in rgb format, for example "12 12 12") or undefined if you want to remove the channel token.`));
}
function qi(e) {
  return typeof e == "number" ? `${e}px` : typeof e == "string" || typeof e == "function" || Array.isArray(e) ? e : "8px";
}
const Be = (e) => {
  try {
    return e();
  } catch {
  }
}, Ji = (e = "mui") => ui(e);
function Cr(e, r, n, o, a) {
  if (!n)
    return;
  n = n === !0 ? {} : n;
  const i = a === "dark" ? "dark" : "light";
  if (!o) {
    r[a] = _i({
      ...n,
      palette: {
        mode: i,
        ...n == null ? void 0 : n.palette
      },
      colorSpace: e
    });
    return;
  }
  const {
    palette: c,
    ...l
  } = Tr({
    ...o,
    palette: {
      mode: i,
      ...n == null ? void 0 : n.palette
    },
    colorSpace: e
  });
  return r[a] = {
    ...n,
    palette: c,
    opacity: {
      ...to(i),
      ...n == null ? void 0 : n.opacity
    },
    overlays: (n == null ? void 0 : n.overlays) || ro(i)
  }, l;
}
function Qi(e = {}, ...r) {
  const {
    colorSchemes: n = {
      light: !0
    },
    defaultColorScheme: o,
    disableCssColorScheme: a = !1,
    cssVarPrefix: i = "mui",
    nativeColor: c = !1,
    shouldSkipGeneratingVar: l = Vi,
    colorSchemeSelector: h = n.light && n.dark ? "media" : void 0,
    rootSelector: u = ":root",
    ...m
  } = e, p = Object.keys(n)[0], v = o || (n.light && p !== "light" ? "light" : p), S = Ji(i), {
    [v]: g,
    light: A,
    dark: $,
    ...B
  } = n, O = {
    ...B
  };
  let E = g;
  if ((v === "dark" && !("dark" in n) || v === "light" && !("light" in n)) && (E = !0), !E)
    throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The \`colorSchemes.${v}\` option is either missing or invalid.` : _e(21, v));
  let b;
  c && (b = "oklch");
  const N = Cr(b, O, E, m, v);
  A && !O.light && Cr(b, O, A, void 0, "light"), $ && !O.dark && Cr(b, O, $, void 0, "dark");
  let T = {
    defaultColorScheme: v,
    ...N,
    cssVarPrefix: i,
    colorSchemeSelector: h,
    rootSelector: u,
    getCssVar: S,
    colorSchemes: O,
    font: {
      ...Ei(N.typography),
      ...N.font
    },
    spacing: qi(m.spacing)
  };
  Object.keys(T.colorSchemes).forEach((G) => {
    const d = T.colorSchemes[G].palette, P = (M) => {
      const W = M.split("-"), oe = W[1], H = W[2];
      return S(M, d[oe][H]);
    };
    d.mode === "light" && (C(d.common, "background", "#fff"), C(d.common, "onBackground", "#000")), d.mode === "dark" && (C(d.common, "background", "#000"), C(d.common, "onBackground", "#fff"));
    function x(M, W, oe) {
      if (b) {
        let H;
        return M === qe && (H = `transparent ${((1 - oe) * 100).toFixed(0)}%`), M === Z && (H = `#000 ${(oe * 100).toFixed(0)}%`), M === ee && (H = `#fff ${(oe * 100).toFixed(0)}%`), `color-mix(in ${b}, ${W}, ${H})`;
      }
      return M(W, oe);
    }
    if (Gi(d, ["Alert", "AppBar", "Avatar", "Button", "Chip", "FilledInput", "LinearProgress", "Skeleton", "Slider", "SnackbarContent", "SpeedDialAction", "StepConnector", "StepContent", "Switch", "TableCell", "Tooltip"]), d.mode === "light") {
      C(d.Alert, "errorColor", x(Z, d.error.light, 0.6)), C(d.Alert, "infoColor", x(Z, d.info.light, 0.6)), C(d.Alert, "successColor", x(Z, d.success.light, 0.6)), C(d.Alert, "warningColor", x(Z, d.warning.light, 0.6)), C(d.Alert, "errorFilledBg", P("palette-error-main")), C(d.Alert, "infoFilledBg", P("palette-info-main")), C(d.Alert, "successFilledBg", P("palette-success-main")), C(d.Alert, "warningFilledBg", P("palette-warning-main")), C(d.Alert, "errorFilledColor", Be(() => d.getContrastText(d.error.main))), C(d.Alert, "infoFilledColor", Be(() => d.getContrastText(d.info.main))), C(d.Alert, "successFilledColor", Be(() => d.getContrastText(d.success.main))), C(d.Alert, "warningFilledColor", Be(() => d.getContrastText(d.warning.main))), C(d.Alert, "errorStandardBg", x(ee, d.error.light, 0.9)), C(d.Alert, "infoStandardBg", x(ee, d.info.light, 0.9)), C(d.Alert, "successStandardBg", x(ee, d.success.light, 0.9)), C(d.Alert, "warningStandardBg", x(ee, d.warning.light, 0.9)), C(d.Alert, "errorIconColor", P("palette-error-main")), C(d.Alert, "infoIconColor", P("palette-info-main")), C(d.Alert, "successIconColor", P("palette-success-main")), C(d.Alert, "warningIconColor", P("palette-warning-main")), C(d.AppBar, "defaultBg", P("palette-grey-100")), C(d.Avatar, "defaultBg", P("palette-grey-400")), C(d.Button, "inheritContainedBg", P("palette-grey-300")), C(d.Button, "inheritContainedHoverBg", P("palette-grey-A100")), C(d.Chip, "defaultBorder", P("palette-grey-400")), C(d.Chip, "defaultAvatarColor", P("palette-grey-700")), C(d.Chip, "defaultIconColor", P("palette-grey-700")), C(d.FilledInput, "bg", "rgba(0, 0, 0, 0.06)"), C(d.FilledInput, "hoverBg", "rgba(0, 0, 0, 0.09)"), C(d.FilledInput, "disabledBg", "rgba(0, 0, 0, 0.12)"), C(d.LinearProgress, "primaryBg", x(ee, d.primary.main, 0.62)), C(d.LinearProgress, "secondaryBg", x(ee, d.secondary.main, 0.62)), C(d.LinearProgress, "errorBg", x(ee, d.error.main, 0.62)), C(d.LinearProgress, "infoBg", x(ee, d.info.main, 0.62)), C(d.LinearProgress, "successBg", x(ee, d.success.main, 0.62)), C(d.LinearProgress, "warningBg", x(ee, d.warning.main, 0.62)), C(d.Skeleton, "bg", b ? x(qe, d.text.primary, 0.11) : `rgba(${P("palette-text-primaryChannel")} / 0.11)`), C(d.Slider, "primaryTrack", x(ee, d.primary.main, 0.62)), C(d.Slider, "secondaryTrack", x(ee, d.secondary.main, 0.62)), C(d.Slider, "errorTrack", x(ee, d.error.main, 0.62)), C(d.Slider, "infoTrack", x(ee, d.info.main, 0.62)), C(d.Slider, "successTrack", x(ee, d.success.main, 0.62)), C(d.Slider, "warningTrack", x(ee, d.warning.main, 0.62));
      const M = b ? x(Z, d.background.default, 0.6825) : Kt(d.background.default, 0.8);
      C(d.SnackbarContent, "bg", M), C(d.SnackbarContent, "color", Be(() => b ? Ar.text.primary : d.getContrastText(M))), C(d.SpeedDialAction, "fabHoverBg", Kt(d.background.paper, 0.15)), C(d.StepConnector, "border", P("palette-grey-400")), C(d.StepContent, "border", P("palette-grey-400")), C(d.Switch, "defaultColor", P("palette-common-white")), C(d.Switch, "defaultDisabledColor", P("palette-grey-100")), C(d.Switch, "primaryDisabledColor", x(ee, d.primary.main, 0.62)), C(d.Switch, "secondaryDisabledColor", x(ee, d.secondary.main, 0.62)), C(d.Switch, "errorDisabledColor", x(ee, d.error.main, 0.62)), C(d.Switch, "infoDisabledColor", x(ee, d.info.main, 0.62)), C(d.Switch, "successDisabledColor", x(ee, d.success.main, 0.62)), C(d.Switch, "warningDisabledColor", x(ee, d.warning.main, 0.62)), C(d.TableCell, "border", x(ee, x(qe, d.divider, 1), 0.88)), C(d.Tooltip, "bg", x(qe, d.grey[700], 0.92));
    }
    if (d.mode === "dark") {
      C(d.Alert, "errorColor", x(ee, d.error.light, 0.6)), C(d.Alert, "infoColor", x(ee, d.info.light, 0.6)), C(d.Alert, "successColor", x(ee, d.success.light, 0.6)), C(d.Alert, "warningColor", x(ee, d.warning.light, 0.6)), C(d.Alert, "errorFilledBg", P("palette-error-dark")), C(d.Alert, "infoFilledBg", P("palette-info-dark")), C(d.Alert, "successFilledBg", P("palette-success-dark")), C(d.Alert, "warningFilledBg", P("palette-warning-dark")), C(d.Alert, "errorFilledColor", Be(() => d.getContrastText(d.error.dark))), C(d.Alert, "infoFilledColor", Be(() => d.getContrastText(d.info.dark))), C(d.Alert, "successFilledColor", Be(() => d.getContrastText(d.success.dark))), C(d.Alert, "warningFilledColor", Be(() => d.getContrastText(d.warning.dark))), C(d.Alert, "errorStandardBg", x(Z, d.error.light, 0.9)), C(d.Alert, "infoStandardBg", x(Z, d.info.light, 0.9)), C(d.Alert, "successStandardBg", x(Z, d.success.light, 0.9)), C(d.Alert, "warningStandardBg", x(Z, d.warning.light, 0.9)), C(d.Alert, "errorIconColor", P("palette-error-main")), C(d.Alert, "infoIconColor", P("palette-info-main")), C(d.Alert, "successIconColor", P("palette-success-main")), C(d.Alert, "warningIconColor", P("palette-warning-main")), C(d.AppBar, "defaultBg", P("palette-grey-900")), C(d.AppBar, "darkBg", P("palette-background-paper")), C(d.AppBar, "darkColor", P("palette-text-primary")), C(d.Avatar, "defaultBg", P("palette-grey-600")), C(d.Button, "inheritContainedBg", P("palette-grey-800")), C(d.Button, "inheritContainedHoverBg", P("palette-grey-700")), C(d.Chip, "defaultBorder", P("palette-grey-700")), C(d.Chip, "defaultAvatarColor", P("palette-grey-300")), C(d.Chip, "defaultIconColor", P("palette-grey-300")), C(d.FilledInput, "bg", "rgba(255, 255, 255, 0.09)"), C(d.FilledInput, "hoverBg", "rgba(255, 255, 255, 0.13)"), C(d.FilledInput, "disabledBg", "rgba(255, 255, 255, 0.12)"), C(d.LinearProgress, "primaryBg", x(Z, d.primary.main, 0.5)), C(d.LinearProgress, "secondaryBg", x(Z, d.secondary.main, 0.5)), C(d.LinearProgress, "errorBg", x(Z, d.error.main, 0.5)), C(d.LinearProgress, "infoBg", x(Z, d.info.main, 0.5)), C(d.LinearProgress, "successBg", x(Z, d.success.main, 0.5)), C(d.LinearProgress, "warningBg", x(Z, d.warning.main, 0.5)), C(d.Skeleton, "bg", b ? x(qe, d.text.primary, 0.13) : `rgba(${P("palette-text-primaryChannel")} / 0.13)`), C(d.Slider, "primaryTrack", x(Z, d.primary.main, 0.5)), C(d.Slider, "secondaryTrack", x(Z, d.secondary.main, 0.5)), C(d.Slider, "errorTrack", x(Z, d.error.main, 0.5)), C(d.Slider, "infoTrack", x(Z, d.info.main, 0.5)), C(d.Slider, "successTrack", x(Z, d.success.main, 0.5)), C(d.Slider, "warningTrack", x(Z, d.warning.main, 0.5));
      const M = b ? x(ee, d.background.default, 0.985) : Kt(d.background.default, 0.98);
      C(d.SnackbarContent, "bg", M), C(d.SnackbarContent, "color", Be(() => b ? Xn.text.primary : d.getContrastText(M))), C(d.SpeedDialAction, "fabHoverBg", Kt(d.background.paper, 0.15)), C(d.StepConnector, "border", P("palette-grey-600")), C(d.StepContent, "border", P("palette-grey-600")), C(d.Switch, "defaultColor", P("palette-grey-300")), C(d.Switch, "defaultDisabledColor", P("palette-grey-600")), C(d.Switch, "primaryDisabledColor", x(Z, d.primary.main, 0.55)), C(d.Switch, "secondaryDisabledColor", x(Z, d.secondary.main, 0.55)), C(d.Switch, "errorDisabledColor", x(Z, d.error.main, 0.55)), C(d.Switch, "infoDisabledColor", x(Z, d.info.main, 0.55)), C(d.Switch, "successDisabledColor", x(Z, d.success.main, 0.55)), C(d.Switch, "warningDisabledColor", x(Z, d.warning.main, 0.55)), C(d.TableCell, "border", x(Z, x(qe, d.divider, 1), 0.68)), C(d.Tooltip, "bg", x(qe, d.grey[700], 0.92));
    }
    Me(d.background, "default"), Me(d.background, "paper"), Me(d.common, "background"), Me(d.common, "onBackground"), Me(d, "divider"), Object.keys(d).forEach((M) => {
      const W = d[M];
      M !== "tonalOffset" && W && typeof W == "object" && (W.main && C(d[M], "mainChannel", Bt(Ot(W.main))), W.light && C(d[M], "lightChannel", Bt(Ot(W.light))), W.dark && C(d[M], "darkChannel", Bt(Ot(W.dark))), W.contrastText && C(d[M], "contrastTextChannel", Bt(Ot(W.contrastText))), M === "text" && (Me(d[M], "primary"), Me(d[M], "secondary")), M === "action" && (W.active && Me(d[M], "active"), W.selected && Me(d[M], "selected")));
    });
  }), T = r.reduce((G, d) => Ie(G, d), T);
  const V = {
    prefix: i,
    disableCssColorScheme: a,
    shouldSkipGeneratingVar: l,
    getSelector: Ki(T),
    enableContrastVars: c
  }, {
    vars: U,
    generateThemeVars: L,
    generateStyleSheets: de
  } = pi(T, V);
  return T.vars = U, Object.entries(T.colorSchemes[T.defaultColorScheme]).forEach(([G, d]) => {
    T[G] = d;
  }), T.generateThemeVars = L, T.generateStyleSheets = de, T.generateSpacing = function() {
    return _n(m.spacing, Rr(this));
  }, T.getColorSchemeSelector = gi(h), T.spacing = T.generateSpacing(), T.shouldSkipGeneratingVar = l, T.unstable_sxConfig = {
    ...ur,
    ...m == null ? void 0 : m.unstable_sxConfig
  }, T.unstable_sx = function(d) {
    return yt({
      sx: d,
      theme: this
    });
  }, T.toRuntimeSource = eo, T;
}
function vn(e, r, n) {
  e.colorSchemes && n && (e.colorSchemes[r] = {
    ...n !== !0 && n,
    palette: Ur({
      ...n === !0 ? {} : n.palette,
      mode: r
    })
    // cast type to skip module augmentation test
  });
}
function Yi(e = {}, ...r) {
  const {
    palette: n,
    cssVariables: o = !1,
    colorSchemes: a = n ? void 0 : {
      light: !0
    },
    defaultColorScheme: i = n == null ? void 0 : n.mode,
    ...c
  } = e, l = i || "light", h = a == null ? void 0 : a[l], u = {
    ...a,
    ...n ? {
      [l]: {
        ...typeof h != "boolean" && h,
        palette: n
      }
    } : void 0
  };
  if (o === !1) {
    if (!("colorSchemes" in e))
      return Tr(e, ...r);
    let m = n;
    "palette" in e || u[l] && (u[l] !== !0 ? m = u[l].palette : l === "dark" && (m = {
      mode: "dark"
    }));
    const p = Tr({
      ...e,
      palette: m
    }, ...r);
    return p.defaultColorScheme = l, p.colorSchemes = u, p.palette.mode === "light" && (p.colorSchemes.light = {
      ...u.light !== !0 && u.light,
      palette: p.palette
    }, vn(p, "dark", u.dark)), p.palette.mode === "dark" && (p.colorSchemes.dark = {
      ...u.dark !== !0 && u.dark,
      palette: p.palette
    }, vn(p, "light", u.light)), p;
  }
  return !n && !("light" in u) && l === "light" && (u.light = !0), Qi({
    ...c,
    colorSchemes: u,
    defaultColorScheme: l,
    ...typeof o != "boolean" && o
  }, ...r);
}
const Xi = Yi(), Zi = "$$material";
function es(e) {
  return e !== "ownerState" && e !== "theme" && e !== "sx" && e !== "as";
}
const ts = (e) => es(e) && e !== "classes", rs = Za({
  themeId: Zi,
  defaultTheme: Xi,
  rootShouldForwardProp: ts
}), ns = hi;
process.env.NODE_ENV !== "production" && (X.node, X.object.isRequired);
function os(e) {
  return di(e);
}
function as(e) {
  return Wr("MuiSvgIcon", e);
}
qa("MuiSvgIcon", ["root", "colorPrimary", "colorSecondary", "colorAction", "colorError", "colorDisabled", "fontSizeInherit", "fontSizeSmall", "fontSizeMedium", "fontSizeLarge"]);
const is = (e) => {
  const {
    color: r,
    fontSize: n,
    classes: o
  } = e, a = {
    root: ["root", r !== "inherit" && `color${tt(r)}`, `fontSize${tt(n)}`]
  };
  return Uo(a, as, o);
}, ss = rs("svg", {
  name: "MuiSvgIcon",
  slot: "Root",
  overridesResolver: (e, r) => {
    const {
      ownerState: n
    } = e;
    return [r.root, n.color !== "inherit" && r[`color${tt(n.color)}`], r[`fontSize${tt(n.fontSize)}`]];
  }
})(ns(({
  theme: e
}) => {
  var r, n, o, a, i, c, l, h, u, m, p, v, S, g;
  return {
    userSelect: "none",
    width: "1em",
    height: "1em",
    display: "inline-block",
    flexShrink: 0,
    transition: (a = (r = e.transitions) == null ? void 0 : r.create) == null ? void 0 : a.call(r, "fill", {
      duration: (o = (n = (e.vars ?? e).transitions) == null ? void 0 : n.duration) == null ? void 0 : o.shorter
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
          fontSize: ((c = (i = e.typography) == null ? void 0 : i.pxToRem) == null ? void 0 : c.call(i, 20)) || "1.25rem"
        }
      },
      {
        props: {
          fontSize: "medium"
        },
        style: {
          fontSize: ((h = (l = e.typography) == null ? void 0 : l.pxToRem) == null ? void 0 : h.call(l, 24)) || "1.5rem"
        }
      },
      {
        props: {
          fontSize: "large"
        },
        style: {
          fontSize: ((m = (u = e.typography) == null ? void 0 : u.pxToRem) == null ? void 0 : m.call(u, 35)) || "2.1875rem"
        }
      },
      // TODO v5 deprecate color prop, v6 remove for sx
      ...Object.entries((e.vars ?? e).palette).filter(([, A]) => A && A.main).map(([A]) => {
        var $, B;
        return {
          props: {
            color: A
          },
          style: {
            color: (B = ($ = (e.vars ?? e).palette) == null ? void 0 : $[A]) == null ? void 0 : B.main
          }
        };
      }),
      {
        props: {
          color: "action"
        },
        style: {
          color: (v = (p = (e.vars ?? e).palette) == null ? void 0 : p.action) == null ? void 0 : v.active
        }
      },
      {
        props: {
          color: "disabled"
        },
        style: {
          color: (g = (S = (e.vars ?? e).palette) == null ? void 0 : S.action) == null ? void 0 : g.disabled
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
})), er = /* @__PURE__ */ Ue.forwardRef(function(r, n) {
  const o = os({
    props: r,
    name: "MuiSvgIcon"
  }), {
    children: a,
    className: i,
    color: c = "inherit",
    component: l = "svg",
    fontSize: h = "medium",
    htmlColor: u,
    inheritViewBox: m = !1,
    titleAccess: p,
    viewBox: v = "0 0 24 24",
    ...S
  } = o, g = /* @__PURE__ */ Ue.isValidElement(a) && a.type === "svg", A = {
    ...o,
    color: c,
    component: l,
    fontSize: h,
    instanceFontSize: r.fontSize,
    inheritViewBox: m,
    viewBox: v,
    hasSvgAsChild: g
  }, $ = {};
  m || ($.viewBox = v);
  const B = is(A);
  return /* @__PURE__ */ s(ss, {
    as: l,
    className: jn(B.root, i),
    focusable: "false",
    color: u,
    "aria-hidden": p ? void 0 : !0,
    role: p ? "img" : void 0,
    ref: n,
    ...$,
    ...S,
    ...g && a.props,
    ownerState: A,
    children: [g ? a.props.children : a, p ? /* @__PURE__ */ t("title", {
      children: p
    }) : null]
  });
});
process.env.NODE_ENV !== "production" && (er.propTypes = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Node passed into the SVG element.
   */
  children: X.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: X.object,
  /**
   * @ignore
   */
  className: X.string,
  /**
   * The color of the component.
   * It supports both default and custom theme colors, which can be added as shown in the
   * [palette customization guide](https://mui.com/material-ui/customization/palette/#custom-colors).
   * You can use the `htmlColor` prop to apply a color attribute to the SVG element.
   * @default 'inherit'
   */
  color: X.oneOfType([X.oneOf(["inherit", "action", "disabled", "primary", "secondary", "error", "info", "success", "warning"]), X.string]),
  /**
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: X.elementType,
  /**
   * The fontSize applied to the icon. Defaults to 24px, but can be configure to inherit font size.
   * @default 'medium'
   */
  fontSize: X.oneOfType([X.oneOf(["inherit", "large", "medium", "small"]), X.string]),
  /**
   * Applies a color attribute to the SVG element.
   */
  htmlColor: X.string,
  /**
   * If `true`, the root node will inherit the custom `component`'s viewBox and the `viewBox`
   * prop will be ignored.
   * Useful when you want to reference a custom `component` and have `SvgIcon` pass that
   * `component`'s viewBox to the root node.
   * @default false
   */
  inheritViewBox: X.bool,
  /**
   * The shape-rendering attribute. The behavior of the different options is described on the
   * [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/shape-rendering).
   * If you are having issues with blurry icons you should investigate this prop.
   */
  shapeRendering: X.string,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: X.oneOfType([X.arrayOf(X.oneOfType([X.func, X.object, X.bool])), X.func, X.object]),
  /**
   * Provides a human-readable title for the element that contains it.
   * https://www.w3.org/TR/SVG-access/#Equivalent
   */
  titleAccess: X.string,
  /**
   * Allows you to redefine what the coordinates without units mean inside an SVG element.
   * For example, if the SVG element is 500 (width) by 200 (height),
   * and you pass viewBox="0 0 50 20",
   * this means that the coordinates inside the SVG will go from the top left corner (0,0)
   * to bottom right (50,20) and each unit will be worth 10px.
   * @default '0 0 24 24'
   */
  viewBox: X.string
});
er.muiName = "SvgIcon";
function Y(e, r) {
  function n(o, a) {
    return /* @__PURE__ */ t(er, {
      "data-testid": process.env.NODE_ENV !== "production" ? `${r}Icon` : void 0,
      ref: a,
      ...o,
      children: e
    });
  }
  return process.env.NODE_ENV !== "production" && (n.displayName = `${r}Icon`), n.muiName = er.muiName, /* @__PURE__ */ Ue.memo(/* @__PURE__ */ Ue.forwardRef(n));
}
const Ne = Y(/* @__PURE__ */ t("path", {
  d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8z"
}), "CheckCircle"), Pe = Y(/* @__PURE__ */ t("path", {
  d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m1 15h-2v-2h2zm0-4h-2V7h2z"
}), "Error"), jt = Y(/* @__PURE__ */ t("path", {
  d: "M1 21h22L12 2zm12-3h-2v-2h2zm0-4h-2v-4h2z"
}), "Warning");
async function ls(e) {
  const r = `${e}/api/client-manifest`, n = await fetch(r);
  if (!n.ok)
    throw new Error(
      `Failed to fetch client manifest: ${n.status} ${n.statusText}`
    );
  const o = await n.json(), a = {};
  for (const [i, c] of Object.entries(o.routes)) {
    const [l, h] = i.split(".");
    if (!l || !h) {
      console.warn(`Invalid route key: ${i}, skipping`);
      continue;
    }
    const u = l.replace(/-./g, (m) => m[1].toUpperCase());
    a[u] || (a[u] = {}), a[u][h] = cs(
      e,
      c.method,
      c.path
    );
  }
  return a;
}
function cs(e, r, n) {
  return async (o) => {
    const a = ds(e, n, o, r), i = {
      method: r,
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "same-origin"
      // Required for Basic Auth support
    };
    if (r !== "GET" && o)
      if (!n.includes(":"))
        i.body = JSON.stringify(o);
      else {
        const h = Pr(n), u = Object.keys(o).filter((m) => !h.includes(m)).reduce((m, p) => (m[p] = o[p], m), {});
        Object.keys(u).length > 0 && (i.body = JSON.stringify(u));
      }
    const c = await fetch(a, i);
    if (!c.ok)
      throw new Error(`API request failed: ${c.status} ${c.statusText}`);
    return c.json();
  };
}
function ds(e, r, n, o) {
  let a = r;
  if (n && r.includes(":")) {
    const i = Pr(r);
    for (const c of i)
      n[c] !== void 0 && (a = a.replace(`:${c}`, encodeURIComponent(n[c])));
  }
  if (o === "GET" && n) {
    const i = r.includes(":") ? Pr(r) : [], c = Object.keys(n).filter((l) => !i.includes(l)).reduce((l, h) => (l[h] = n[h], l), {});
    if (Object.keys(c).length > 0) {
      const l = new URLSearchParams();
      for (const [h, u] of Object.entries(c))
        u != null && l.append(h, String(u));
      a += `?${l.toString()}`;
    }
  }
  return `${e}${a}`;
}
function Pr(e) {
  const r = e.match(/:([a-zA-Z0-9_]+)/g);
  return r ? r.map((n) => n.slice(1)) : [];
}
class hs {
  constructor(r = "") {
    Ht(this, "baseUrl");
    Ht(this, "client", null);
    Ht(this, "clientPromise", null);
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
    this.clientPromise = ls(this.baseUrl);
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
    const o = `${this.baseUrl}/api${r.startsWith("/") ? r : `/${r}`}`, a = await this._fetch(o, {
      ...n,
      headers: {
        "Content-Type": "application/json",
        ...n == null ? void 0 : n.headers
      }
    });
    if (!a.ok) {
      const i = await a.json().catch(() => ({}));
      throw new Error(i.error || i.message || `Request failed: ${a.statusText}`);
    }
    return a.json();
  }
  // ==================
  // Plugin Feature Detection
  // ==================
  /**
   * Detect which user management plugins are available by probing their endpoints
   */
  async detectFeatures() {
    const [r, n, o] = await Promise.all([
      this.checkEndpoint("/api/users"),
      this.checkEndpoint("/api/bans"),
      this.checkEndpoint("/api/entitlements/available")
    ]);
    let a = !0;
    if (o)
      try {
        a = (await this.getEntitlementsStatus()).readonly;
      } catch {
      }
    return { users: r, bans: n, entitlements: o, entitlementsReadonly: a };
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
      const o = await n.json().catch(() => ({}));
      throw new Error(o.error || `Accept invitation failed: ${n.statusText}`);
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
  async banUser(r, n, o) {
    let a;
    if (o) {
      const c = new Date(o), l = /* @__PURE__ */ new Date();
      a = Math.max(0, Math.floor((c.getTime() - l.getTime()) / 1e3));
    }
    const i = await this._fetch(`${this.baseUrl}/api/bans/email/${encodeURIComponent(r)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: n, duration: a })
    });
    if (!i.ok) {
      const c = await i.json().catch(() => ({}));
      throw new Error(c.error || `Ban request failed: ${i.statusText}`);
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
    const o = await this._fetch(
      `${this.baseUrl}/api/entitlements/${encodeURIComponent(r)}/check/${encodeURIComponent(n)}`
    );
    if (!o.ok)
      throw new Error(`Entitlement check failed: ${o.statusText}`);
    return o.json();
  }
  async getAvailableEntitlements() {
    const r = await this._fetch(`${this.baseUrl}/api/entitlements/available`);
    if (!r.ok)
      throw new Error(`Available entitlements request failed: ${r.statusText}`);
    return (await r.json()).entitlements;
  }
  async grantEntitlement(r, n) {
    const o = await this._fetch(`${this.baseUrl}/api/entitlements/${encodeURIComponent(r)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entitlement: n })
    });
    if (!o.ok) {
      const a = await o.json().catch(() => ({}));
      throw new Error(a.error || `Grant entitlement failed: ${o.statusText}`);
    }
  }
  async revokeEntitlement(r, n) {
    const o = await this._fetch(
      `${this.baseUrl}/api/entitlements/${encodeURIComponent(r)}/${encodeURIComponent(n)}`,
      { method: "DELETE" }
    );
    if (!o.ok)
      throw new Error(`Revoke entitlement failed: ${o.statusText}`);
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
      const o = await n.json().catch(() => ({}));
      throw new Error(o.error || `Disconnect client failed: ${n.statusText}`);
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
    const n = `${this.baseUrl}/api/preferences`, o = await this._fetch(n, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(r)
    });
    if (!o.ok) {
      const a = await o.json().catch(() => ({ error: o.statusText }));
      throw new Error(a.error || `Failed to update preferences: ${o.statusText}`);
    }
    return o.json();
  }
  async deletePreferences() {
    const r = `${this.baseUrl}/api/preferences`, n = await this._fetch(r, {
      method: "DELETE"
    });
    if (!n.ok)
      throw new Error(`Failed to delete preferences: ${n.statusText}`);
  }
}
const K = new hs(), no = Tn(null);
function us({ initialWidgets: e = [], children: r }) {
  const [n, o] = y(
    e.map((h) => ({ ...h, visible: h.visible !== !1, priority: h.priority ?? 100 }))
  ), a = be((h) => {
    o((u) => u.some((p) => p.id === h.id) ? u.map((p) => p.id === h.id ? { ...h, visible: h.visible !== !1, priority: h.priority ?? 100 } : p) : [...u, { ...h, visible: h.visible !== !1, priority: h.priority ?? 100 }]);
  }, []), i = be((h) => {
    o((u) => u.filter((m) => m.id !== h));
  }, []), c = be((h, u) => {
    o((m) => m.map((p) => p.id === h ? { ...p, visible: u ?? !p.visible } : p));
  }, []), l = be(() => n.filter((h) => h.visible !== !1).sort((h, u) => (h.priority ?? 100) - (u.priority ?? 100)), [n]);
  return /* @__PURE__ */ t(no.Provider, { value: { widgets: n, registerWidget: a, unregisterWidget: i, toggleWidget: c, getVisibleWidgets: l }, children: r });
}
function oo() {
  const e = Pn(no);
  if (!e)
    throw new Error("useDashboardWidgets must be used within a DashboardWidgetProvider");
  return e;
}
function wl(e) {
  const { registerWidget: r, unregisterWidget: n } = oo();
  return y(() => (r(e), null)), () => n(e.id);
}
function ms() {
  const { getVisibleWidgets: e } = oo(), r = e();
  return r.length === 0 ? null : /* @__PURE__ */ t(Fe, { children: r.map((n) => /* @__PURE__ */ s(f, { sx: { mt: 4 }, children: [
    n.title && /* @__PURE__ */ t(k, { variant: "h6", sx: { mb: 2, color: "var(--theme-text-primary)" }, children: n.title }),
    n.component
  ] }, n.id)) });
}
const ao = Tn(null);
function fs({
  initialComponents: e = [],
  children: r
}) {
  const [n, o] = y(() => {
    const m = /* @__PURE__ */ new Map();
    for (const p of e)
      m.set(p.name, p.component);
    return m;
  }), a = be((m, p) => {
    o((v) => {
      const S = new Map(v);
      return S.set(m, p), S;
    });
  }, []), i = be((m) => {
    o((p) => {
      const v = new Map(p);
      for (const S of m)
        v.set(S.name, S.component);
      return v;
    });
  }, []), c = be((m) => n.get(m) ?? null, [n]), l = be((m) => n.has(m), [n]), h = be(() => Array.from(n.keys()), [n]), u = xo(
    () => ({
      registerComponent: a,
      registerComponents: i,
      getComponent: c,
      hasComponent: l,
      getRegisteredNames: h
    }),
    [a, i, c, l, h]
  );
  return /* @__PURE__ */ t(ao.Provider, { value: u, children: r });
}
function ps() {
  const e = Pn(ao);
  if (!e)
    throw new Error("useWidgetComponentRegistry must be used within a WidgetComponentRegistryProvider");
  return e;
}
function gs({
  widgetType: e,
  defaultOnly: r = !0,
  additionalWidgetIds: n = []
}) {
  const [o, a] = y([]), [i, c] = y(!0), [l, h] = y(null), { getComponent: u, hasComponent: m } = ps();
  if (te(() => {
    (async () => {
      try {
        const S = await K.getUiContributions();
        a(S.widgets || []), h(null);
      } catch (S) {
        h(S instanceof Error ? S.message : "Failed to fetch widgets");
      } finally {
        c(!1);
      }
    })();
  }, []), i)
    return /* @__PURE__ */ t(f, { sx: { display: "flex", justifyContent: "center", py: 4 }, children: /* @__PURE__ */ t(re, { size: 24 }) });
  if (l)
    return /* @__PURE__ */ t(J, { severity: "error", sx: { mt: 2 }, children: l });
  const p = o.filter((v) => e && v.type !== e ? !1 : r ? v.showByDefault || n.includes(v.id) : !0).filter((v) => m(v.component) ? !0 : (console.warn(`Widget "${v.id}" references unregistered component "${v.component}"`), !1)).sort((v, S) => (v.priority ?? 100) - (S.priority ?? 100));
  return p.length === 0 ? null : /* @__PURE__ */ t(Fe, { children: p.map((v) => {
    const S = u(v.component);
    return /* @__PURE__ */ s(f, { sx: { mt: 4 }, children: [
      v.title && /* @__PURE__ */ t(k, { variant: "h6", sx: { mb: 2, color: "var(--theme-text-primary)" }, children: v.title }),
      S && /* @__PURE__ */ t(S, {})
    ] }, v.id);
  }) });
}
function ys(e) {
  switch (e) {
    case "healthy":
      return /* @__PURE__ */ t(Ne, { sx: { fontSize: 24, color: "var(--theme-success)" } });
    case "degraded":
      return /* @__PURE__ */ t(jt, { sx: { fontSize: 24, color: "var(--theme-warning)" } });
    case "unhealthy":
      return /* @__PURE__ */ t(Pe, { sx: { fontSize: 24, color: "var(--theme-error)" } });
    default:
      return /* @__PURE__ */ t(jt, { sx: { fontSize: 24, color: "var(--theme-text-secondary)" } });
  }
}
function xn(e) {
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
function bs(e) {
  return e <= 1 ? 1 : e === 2 ? 2 : e === 3 ? 3 : 4;
}
function vs() {
  const [e, r] = y(null), [n, o] = y(null);
  if (te(() => {
    const c = async () => {
      try {
        const h = await K.getHealth();
        r(h), o(null);
      } catch (h) {
        o(h instanceof Error ? h.message : "Failed to fetch health");
      }
    };
    c();
    const l = setInterval(c, 1e4);
    return () => clearInterval(l);
  }, []), n)
    return /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)", border: "1px solid var(--theme-error)" }, children: /* @__PURE__ */ t(R, { children: /* @__PURE__ */ t(F, { variant: "body2", customColor: "var(--theme-error)", content: n }) }) });
  const a = e ? Object.entries(e.checks) : [];
  if (a.length === 0)
    return /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(R, { children: /* @__PURE__ */ t(F, { variant: "body2", customColor: "var(--theme-text-secondary)", content: "No health checks configured" }) }) });
  const i = bs(a.length);
  return /* @__PURE__ */ t(rr, { columns: i, spacing: "medium", equalHeight: !0, children: a.map(([c, l]) => /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(R, { children: /* @__PURE__ */ s(f, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
    ys(l.status),
    /* @__PURE__ */ s(f, { sx: { flex: 1, minWidth: 0 }, children: [
      /* @__PURE__ */ t(
        F,
        {
          variant: "body1",
          fontWeight: "500",
          content: c.charAt(0).toUpperCase() + c.slice(1),
          customColor: "var(--theme-text-primary)"
        }
      ),
      /* @__PURE__ */ s(f, { sx: { display: "flex", alignItems: "center", gap: 1, mt: 0.5 }, children: [
        /* @__PURE__ */ t(
          ne,
          {
            label: l.status,
            size: "small",
            sx: {
              bgcolor: xn(l.status) + "20",
              color: xn(l.status),
              fontSize: "0.75rem",
              height: 20
            }
          }
        ),
        l.latency !== void 0 && /* @__PURE__ */ t(
          F,
          {
            variant: "caption",
            content: `${l.latency}ms`,
            customColor: "var(--theme-text-secondary)"
          }
        )
      ] })
    ] })
  ] }) }) }, c)) });
}
function xs() {
  const [e, r] = y(null), [n, o] = y(!0), [a, i] = y(null);
  if (te(() => {
    (async () => {
      try {
        const u = await K.fetch("/ai-proxy/config");
        r(u);
      } catch (u) {
        i(u instanceof Error ? u.message : "Failed to fetch integrations");
      } finally {
        o(!1);
      }
    })();
  }, []), n)
    return /* @__PURE__ */ t(f, { sx: { display: "flex", justifyContent: "center", py: 2 }, children: /* @__PURE__ */ t(re, { size: 20 }) });
  if (a)
    return /* @__PURE__ */ t(J, { severity: "warning", sx: { py: 0.5, fontSize: 13 }, children: "Unable to load integrations" });
  if (!e) return null;
  const c = e.integrations.filter((h) => h.configured).length, l = e.integrations.length;
  return /* @__PURE__ */ s(
    f,
    {
      sx: {
        bgcolor: "var(--theme-surface)",
        borderRadius: 2,
        p: 2,
        border: "1px solid var(--theme-border)"
      },
      children: [
        /* @__PURE__ */ s(f, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }, children: [
          /* @__PURE__ */ s(k, { variant: "subtitle2", sx: { color: "var(--theme-text-secondary)" }, children: [
            c,
            " of ",
            l,
            " configured"
          ] }),
          /* @__PURE__ */ s(k, { variant: "subtitle2", sx: { color: "var(--theme-text-secondary)" }, children: [
            e.stats.totalRequests,
            " requests"
          ] })
        ] }),
        /* @__PURE__ */ t(f, { sx: { display: "flex", flexDirection: "column", gap: 1.5 }, children: e.integrations.map((h) => /* @__PURE__ */ s(
          f,
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
              /* @__PURE__ */ s(f, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                h.configured ? /* @__PURE__ */ t(Ne, { sx: { color: "var(--theme-success)", fontSize: 18 } }) : /* @__PURE__ */ t(Pe, { sx: { color: "var(--theme-text-secondary)", fontSize: 18 } }),
                /* @__PURE__ */ s(f, { children: [
                  /* @__PURE__ */ t(k, { variant: "body2", sx: { color: "var(--theme-text-primary)", fontWeight: 500 }, children: h.name }),
                  /* @__PURE__ */ t(k, { variant: "caption", sx: { color: "var(--theme-text-secondary)" }, children: h.description })
                ] })
              ] }),
              /* @__PURE__ */ t(
                ne,
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
const _r = Y(/* @__PURE__ */ t("path", {
  d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2M4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12m8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8"
}), "Block"), Cs = {
  supertokens: "SuperTokens",
  auth0: "Auth0",
  supabase: "Supabase",
  basic: "Basic Auth"
};
function ws() {
  const [e, r] = y(null), [n, o] = y(!0), [a, i] = y(null);
  if (te(() => {
    (async () => {
      try {
        const u = await K.fetch("/auth/config/status");
        r(u);
      } catch (u) {
        i(u instanceof Error ? u.message : "Failed to fetch auth status");
      } finally {
        o(!1);
      }
    })();
  }, []), n)
    return /* @__PURE__ */ t(f, { sx: { display: "flex", justifyContent: "center", py: 2 }, children: /* @__PURE__ */ t(re, { size: 20 }) });
  if (a)
    return /* @__PURE__ */ t(J, { severity: "warning", sx: { py: 0.5, fontSize: 13 }, children: "Unable to load auth status" });
  if (!e) return null;
  const c = () => {
    switch (e.state) {
      case "enabled":
        return /* @__PURE__ */ t(Ne, { sx: { color: "var(--theme-success)", fontSize: 32 } });
      case "error":
        return /* @__PURE__ */ t(Pe, { sx: { color: "var(--theme-error)", fontSize: 32 } });
      case "disabled":
      default:
        return /* @__PURE__ */ t(_r, { sx: { color: "var(--theme-text-secondary)", fontSize: 32 } });
    }
  }, l = () => {
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
  return /* @__PURE__ */ s(
    f,
    {
      sx: {
        bgcolor: "var(--theme-surface)",
        borderRadius: 2,
        p: 2,
        border: "1px solid var(--theme-border)"
      },
      children: [
        /* @__PURE__ */ s(f, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
          c(),
          /* @__PURE__ */ s(f, { sx: { flex: 1 }, children: [
            /* @__PURE__ */ s(f, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 0.5 }, children: [
              /* @__PURE__ */ t(k, { variant: "subtitle1", sx: { color: "var(--theme-text-primary)", fontWeight: 600 }, children: e.state === "enabled" && e.adapter ? Cs[e.adapter] || e.adapter : e.state === "disabled" ? "Not Configured" : "Configuration Error" }),
              /* @__PURE__ */ t(
                ne,
                {
                  label: e.state.toUpperCase(),
                  size: "small",
                  sx: {
                    bgcolor: `${l()}20`,
                    color: l(),
                    fontWeight: 600,
                    fontSize: 10,
                    height: 20
                  }
                }
              )
            ] }),
            /* @__PURE__ */ t(k, { variant: "body2", sx: { color: "var(--theme-text-secondary)" }, children: e.state === "enabled" ? "Authentication is active" : e.state === "disabled" ? "Set AUTH_ADAPTER environment variable" : e.error || "Check configuration" })
          ] })
        ] }),
        e.missingVars && e.missingVars.length > 0 && /* @__PURE__ */ s(J, { severity: "warning", sx: { mt: 2, py: 0.5, "& .MuiAlert-message": { fontSize: 12 } }, children: [
          "Missing: ",
          e.missingVars.join(", ")
        ] })
      ]
    }
  );
}
const Ss = Y(/* @__PURE__ */ t("path", {
  d: "m1 9 2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9m8 8 3 3 3-3c-1.65-1.66-4.34-1.66-6 0m-4-4 2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13"
}), "Wifi"), Cn = Y(/* @__PURE__ */ t("path", {
  d: "M22.99 9C19.15 5.16 13.8 3.76 8.84 4.78l2.52 2.52c3.47-.17 6.99 1.05 9.63 3.7zm-4 4c-1.29-1.29-2.84-2.13-4.49-2.56l3.53 3.53zM2 3.05 5.07 6.1C3.6 6.82 2.22 7.78 1 9l1.99 2c1.24-1.24 2.67-2.16 4.2-2.77l2.24 2.24C7.81 10.89 6.27 11.73 5 13v.01L6.99 15c1.36-1.36 3.14-2.04 4.92-2.06L18.98 20l1.27-1.26L3.29 1.79zM9 17l3 3 3-3c-1.65-1.66-4.34-1.66-6 0"
}), "WifiOff"), ks = Y(/* @__PURE__ */ t("path", {
  d: "M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1m-1 9h-4v-7h4z"
}), "Devices"), io = Y(/* @__PURE__ */ t("path", {
  d: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4"
}), "Person"), Es = Y(/* @__PURE__ */ t("path", {
  d: "M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"
}), "Send");
function wr(e) {
  return e >= 1e6 ? `${(e / 1e6).toFixed(1)}M` : e >= 1e3 ? `${(e / 1e3).toFixed(1)}K` : e.toString();
}
function Is(e) {
  return e < 1e3 ? `${e}ms` : e < 6e4 ? `${(e / 1e3).toFixed(0)}s` : e < 36e5 ? `${(e / 6e4).toFixed(0)}m` : `${(e / 36e5).toFixed(1)}h`;
}
function $s() {
  const [e, r] = y(null), [n, o] = y(null), [a, i] = y(!0);
  if (te(() => {
    const h = async () => {
      try {
        const m = await K.getNotificationsStats();
        r(m), o(null);
      } catch (m) {
        m instanceof Error && m.message.includes("404") ? o("Notifications plugin not enabled") : o(m instanceof Error ? m.message : "Failed to fetch stats");
      } finally {
        i(!1);
      }
    };
    h();
    const u = setInterval(h, 5e3);
    return () => clearInterval(u);
  }, []), a)
    return /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(R, { children: /* @__PURE__ */ t(tr, {}) }) });
  if (n)
    return /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)", border: "1px solid var(--theme-border)" }, children: /* @__PURE__ */ t(R, { children: /* @__PURE__ */ s(f, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
      /* @__PURE__ */ t(Cn, { sx: { color: "var(--theme-text-secondary)" } }),
      /* @__PURE__ */ t(F, { variant: "body2", customColor: "var(--theme-text-secondary)", content: n })
    ] }) }) });
  if (!e)
    return null;
  const c = e.connectionHealth.isHealthy, l = c ? "var(--theme-success)" : "var(--theme-warning)";
  return /* @__PURE__ */ s(f, { children: [
    /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)", mb: 2 }, children: /* @__PURE__ */ t(R, { sx: { py: 1, "&:last-child": { pb: 1 } }, children: /* @__PURE__ */ s(f, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
      /* @__PURE__ */ s(f, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
        c ? /* @__PURE__ */ t(Ss, { sx: { color: l, fontSize: 20 } }) : /* @__PURE__ */ t(Cn, { sx: { color: l, fontSize: 20 } }),
        /* @__PURE__ */ t(
          F,
          {
            variant: "body2",
            content: c ? "Connected" : "Reconnecting...",
            customColor: l,
            fontWeight: "500"
          }
        ),
        e.connectionHealth.isReconnecting && /* @__PURE__ */ t(
          ne,
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
      /* @__PURE__ */ s(f, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        /* @__PURE__ */ t(
          F,
          {
            variant: "caption",
            content: `${e.channels.length} channel${e.channels.length !== 1 ? "s" : ""}`,
            customColor: "var(--theme-text-secondary)"
          }
        ),
        e.lastEventAt && /* @__PURE__ */ t(
          F,
          {
            variant: "caption",
            content: `Last event: ${Is(e.connectionHealth.timeSinceLastEvent)} ago`,
            customColor: "var(--theme-text-secondary)"
          }
        )
      ] })
    ] }) }) }),
    /* @__PURE__ */ s(rr, { columns: 4, spacing: "small", equalHeight: !0, children: [
      /* @__PURE__ */ t(
        zt,
        {
          icon: /* @__PURE__ */ t(ks, { sx: { fontSize: 28 } }),
          label: "Active Clients",
          value: e.currentConnections,
          subValue: `${e.totalConnections} total`,
          color: "var(--theme-primary)"
        }
      ),
      /* @__PURE__ */ t(
        zt,
        {
          icon: /* @__PURE__ */ t(io, { sx: { fontSize: 28 } }),
          label: "By Device",
          value: e.clientsByType.device,
          subValue: `${e.clientsByType.user} by user`,
          color: "var(--theme-info)"
        }
      ),
      /* @__PURE__ */ t(
        zt,
        {
          icon: /* @__PURE__ */ t(Es, { sx: { fontSize: 28 } }),
          label: "Events Routed",
          value: wr(e.eventsRouted),
          subValue: `${wr(e.eventsProcessed)} processed`,
          color: "var(--theme-success)"
        }
      ),
      /* @__PURE__ */ t(
        zt,
        {
          icon: /* @__PURE__ */ t(Pe, { sx: { fontSize: 28 } }),
          label: "Dropped",
          value: wr(e.eventsDroppedNoClients),
          subValue: `${e.eventsParseFailed} parse errors`,
          color: e.eventsDroppedNoClients > 0 ? "var(--theme-warning)" : "var(--theme-text-secondary)"
        }
      )
    ] })
  ] });
}
const As = Y(/* @__PURE__ */ t("path", {
  d: "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1M8 13h8v-2H8zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5"
}), "Link");
function Ts() {
  const [e, r] = y(null), [n, o] = y(!0), [a, i] = y(null), c = async () => {
    try {
      const p = await (await fetch("/api/cms/status")).json();
      r(p), i(null);
    } catch (m) {
      i(m instanceof Error ? m.message : "Failed to fetch CMS status");
    } finally {
      o(!1);
    }
  };
  if (te(() => {
    c();
    const m = setInterval(c, 3e4);
    return () => clearInterval(m);
  }, []), n)
    return /* @__PURE__ */ t(j, { children: /* @__PURE__ */ t(R, { children: /* @__PURE__ */ t(f, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100px", children: /* @__PURE__ */ t(re, { size: 24 }) }) }) });
  if (a || !e)
    return /* @__PURE__ */ t(j, { children: /* @__PURE__ */ t(R, { children: /* @__PURE__ */ t(J, { severity: "error", children: a || "Failed to load CMS status" }) }) });
  const l = e.status === "running", h = l ? "success" : e.status === "unhealthy" ? "warning" : "error", u = l ? Ne : Pe;
  return /* @__PURE__ */ t(j, { children: /* @__PURE__ */ s(R, { children: [
    /* @__PURE__ */ s(f, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, children: [
      /* @__PURE__ */ t(k, { variant: "h6", children: "Payload CMS" }),
      /* @__PURE__ */ t(
        ne,
        {
          label: e.status.toUpperCase(),
          color: h,
          size: "small",
          icon: /* @__PURE__ */ t(u, {})
        }
      )
    ] }),
    /* @__PURE__ */ s(f, { display: "flex", flexDirection: "column", gap: 1, children: [
      /* @__PURE__ */ s(f, { display: "flex", alignItems: "center", gap: 1, children: [
        /* @__PURE__ */ t(As, { fontSize: "small", color: "action" }),
        /* @__PURE__ */ t(k, { variant: "body2", color: "text.secondary", children: e.url })
      ] }),
      e.error && /* @__PURE__ */ t(J, { severity: "error", sx: { mt: 1 }, children: e.error }),
      /* @__PURE__ */ s(k, { variant: "caption", color: "text.secondary", sx: { mt: 1 }, children: [
        "Last checked: ",
        new Date(e.timestamp).toLocaleTimeString()
      ] })
    ] })
  ] }) });
}
const rt = Y(/* @__PURE__ */ t("path", {
  d: "M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z"
}), "Refresh"), Wt = Y(/* @__PURE__ */ t("path", {
  d: "M8 5v14l11-7z"
}), "PlayArrow");
function Ps() {
  const [e, r] = y(null), [n, o] = y([]), [a, i] = y(!0), [c, l] = y(null), [h, u] = y(null), [m, p] = y(null), v = async () => {
    try {
      const b = await (await fetch("/api/cms/status")).json();
      r(b);
    } catch (E) {
      console.error("Failed to fetch CMS status:", E);
    }
  }, S = async () => {
    try {
      const b = await (await fetch("/api/cms/seeds")).json();
      o(b.seeds || []);
    } catch (E) {
      console.error("Failed to fetch seeds:", E);
    } finally {
      i(!1);
    }
  };
  te(() => {
    v(), S();
    const E = setInterval(v, 3e4);
    return () => clearInterval(E);
  }, []);
  const g = async () => {
    u(null), p(null);
    try {
      const E = await fetch("/api/cms/restart", { method: "POST" }), b = await E.json();
      E.ok ? (p("CMS service restarted successfully"), setTimeout(() => v(), 2e3)) : u(b.message || "Restart not implemented");
    } catch (E) {
      u(E instanceof Error ? E.message : "Failed to restart CMS");
    }
  }, A = async (E) => {
    l(E), u(null), p(null);
    try {
      const N = await (await fetch(`/api/cms/seeds/${E}/execute`, {
        method: "POST"
      })).json();
      N.success ? p(`Seed "${E}" executed successfully`) : u(N.error || "Seed execution failed");
    } catch (b) {
      u(b instanceof Error ? b.message : "Failed to execute seed");
    } finally {
      l(null);
    }
  };
  if (a)
    return /* @__PURE__ */ t(j, { children: /* @__PURE__ */ t(R, { children: /* @__PURE__ */ t(f, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px", children: /* @__PURE__ */ t(re, {}) }) }) });
  const $ = (e == null ? void 0 : e.status) === "running", B = $ ? "success" : (e == null ? void 0 : e.status) === "unhealthy" ? "warning" : "error", O = $ ? Ne : Pe;
  return /* @__PURE__ */ t(j, { children: /* @__PURE__ */ s(R, { children: [
    /* @__PURE__ */ s(f, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, children: [
      /* @__PURE__ */ t(k, { variant: "h6", children: "CMS Service Control" }),
      e && /* @__PURE__ */ t(
        ne,
        {
          label: e.status.toUpperCase(),
          color: B,
          size: "small",
          icon: /* @__PURE__ */ t(O, {})
        }
      )
    ] }),
    h && /* @__PURE__ */ t(J, { severity: "error", sx: { mb: 2 }, onClose: () => u(null), children: h }),
    m && /* @__PURE__ */ t(J, { severity: "success", sx: { mb: 2 }, onClose: () => p(null), children: m }),
    /* @__PURE__ */ s(f, { mb: 3, children: [
      /* @__PURE__ */ t(k, { variant: "subtitle2", gutterBottom: !0, children: "Service Control" }),
      /* @__PURE__ */ t(k, { variant: "body2", color: "text.secondary", mb: 2, children: "Manage the Payload CMS service" }),
      /* @__PURE__ */ t(
        ue,
        {
          variant: "outlined",
          startIcon: /* @__PURE__ */ t(rt, {}),
          onClick: g,
          disabled: !e,
          children: "Restart CMS Service"
        }
      )
    ] }),
    /* @__PURE__ */ t(Dn, { sx: { my: 2 } }),
    /* @__PURE__ */ s(f, { children: [
      /* @__PURE__ */ s(f, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, children: [
        /* @__PURE__ */ t(k, { variant: "subtitle2", children: "Seed Scripts" }),
        /* @__PURE__ */ t(Ae, { size: "small", onClick: S, children: /* @__PURE__ */ t(rt, { fontSize: "small" }) })
      ] }),
      /* @__PURE__ */ t(k, { variant: "body2", color: "text.secondary", mb: 2, children: "Execute database seed scripts for initial data setup" }),
      n.length > 0 ? /* @__PURE__ */ t(zn, { dense: !0, children: n.map((E) => /* @__PURE__ */ t(
        Bn,
        {
          secondaryAction: /* @__PURE__ */ t(
            ue,
            {
              variant: "outlined",
              size: "small",
              startIcon: c === E.name ? /* @__PURE__ */ t(re, { size: 16 }) : /* @__PURE__ */ t(Wt, {}),
              onClick: () => A(E.name),
              disabled: c !== null,
              children: c === E.name ? "Running..." : "Run"
            }
          ),
          children: /* @__PURE__ */ t(
            On,
            {
              primary: E.name,
              secondary: E.file
            }
          )
        },
        E.name
      )) }) : /* @__PURE__ */ t(J, { severity: "info", children: "No seed scripts found. Place seed scripts in the configured seeds directory." })
    ] })
  ] }) });
}
function Ns() {
  const [e, r] = y([]), [n, o] = y(!0), [a, i] = y(null), [c, l] = y(null);
  te(() => {
    h();
  }, []);
  const h = async () => {
    try {
      r([]), i(null);
    } catch (m) {
      i(m instanceof Error ? m.message : "Failed to fetch seeds");
    } finally {
      o(!1);
    }
  }, u = async (m) => {
    l(m);
    try {
      alert(`Seed ${m} executed successfully`);
    } catch (p) {
      alert(`Failed to execute seed: ${p instanceof Error ? p.message : "Unknown error"}`);
    } finally {
      l(null);
    }
  };
  return n ? /* @__PURE__ */ t(j, { children: /* @__PURE__ */ t(R, { children: /* @__PURE__ */ t(f, { sx: { display: "flex", justifyContent: "center", py: 2 }, children: /* @__PURE__ */ t(re, { size: 24 }) }) }) }) : /* @__PURE__ */ t(j, { children: /* @__PURE__ */ s(R, { children: [
    /* @__PURE__ */ t(k, { variant: "h6", gutterBottom: !0, children: "Seed Management" }),
    /* @__PURE__ */ t(k, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Manage and execute seed scripts" }),
    a && /* @__PURE__ */ t(J, { severity: "error", sx: { mb: 2 }, children: a }),
    e.length === 0 ? /* @__PURE__ */ t(J, { severity: "info", children: "No seed scripts found" }) : /* @__PURE__ */ t(zn, { children: e.map((m) => /* @__PURE__ */ t(
      Bn,
      {
        secondaryAction: /* @__PURE__ */ t(
          ue,
          {
            variant: "contained",
            size: "small",
            startIcon: c === m.name ? /* @__PURE__ */ t(re, { size: 16 }) : /* @__PURE__ */ t(Wt, {}),
            onClick: () => u(m.name),
            disabled: c !== null,
            children: "Execute"
          }
        ),
        children: /* @__PURE__ */ t(
          On,
          {
            primary: m.name,
            secondary: `Modified: ${new Date(m.modifiedAt).toLocaleDateString()}`
          }
        )
      },
      m.name
    )) })
  ] }) });
}
function Ds() {
  return /* @__PURE__ */ t(j, { children: /* @__PURE__ */ s(R, { children: [
    /* @__PURE__ */ t(k, { variant: "h6", gutterBottom: !0, children: "Service Control" }),
    /* @__PURE__ */ t(k, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Start, stop, and restart services" }),
    /* @__PURE__ */ t(J, { severity: "info", children: "Service control functionality coming soon. This will allow you to manage service lifecycle." })
  ] }) });
}
function zs() {
  return /* @__PURE__ */ t(j, { children: /* @__PURE__ */ s(R, { children: [
    /* @__PURE__ */ t(k, { variant: "h6", gutterBottom: !0, children: "Environment Configuration" }),
    /* @__PURE__ */ t(k, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "View and manage environment variables" }),
    /* @__PURE__ */ t(J, { severity: "info", children: "Environment configuration UI coming soon. This will allow you to view and edit environment variables." })
  ] }) });
}
function Bs() {
  return /* @__PURE__ */ t(j, { children: /* @__PURE__ */ s(R, { children: [
    /* @__PURE__ */ t(k, { variant: "h6", gutterBottom: !0, children: "Database Operations" }),
    /* @__PURE__ */ t(k, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Backup, restore, and maintain database" }),
    /* @__PURE__ */ t(J, { severity: "info", children: "Database operations UI coming soon. This will allow you to backup and restore your database." })
  ] }) });
}
const _t = Y(/* @__PURE__ */ t("path", {
  d: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"
}), "Delete");
function Os() {
  const [e, r] = y([]), [n, o] = y(""), [a, i] = y(null), [c, l] = y(!0), [h, u] = y(!1), [m, p] = y(null), [v, S] = y(null), [g, A] = y(!1), $ = async () => {
    try {
      const E = await fetch("/api/logs/sources");
      if (!E.ok) throw new Error("Failed to fetch log sources");
      const b = await E.json();
      r(b.sources || []), b.sources && b.sources.length > 0 && !n && o(b.sources[0].name);
    } catch (E) {
      p(E instanceof Error ? E.message : "Failed to fetch log sources");
    }
  }, B = async () => {
    if (n) {
      l(!0), p(null);
      try {
        const E = await fetch(`/api/logs/stats?source=${n}`);
        if (!E.ok) throw new Error("Failed to fetch log stats");
        const b = await E.json();
        i(b);
      } catch (E) {
        p(E instanceof Error ? E.message : "Failed to fetch log stats"), i(null);
      } finally {
        l(!1);
      }
    }
  };
  te(() => {
    $();
  }, []), te(() => {
    n && B();
  }, [n]);
  const O = async () => {
    A(!1), u(!0), p(null), S(null);
    try {
      const E = await fetch("/api/logs/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: n })
      });
      if (!E.ok) {
        const N = await E.json();
        throw new Error(N.error || "Failed to clear logs");
      }
      const b = await E.json();
      S(b.message || "Logs cleared successfully"), await B();
    } catch (E) {
      p(E instanceof Error ? E.message : "Failed to clear logs");
    } finally {
      u(!1);
    }
  };
  return /* @__PURE__ */ t(j, { children: /* @__PURE__ */ s(R, { children: [
    /* @__PURE__ */ t(k, { variant: "h6", gutterBottom: !0, children: "Log Management" }),
    /* @__PURE__ */ t(k, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "View log statistics and clear log files" }),
    m && /* @__PURE__ */ t(J, { severity: "error", sx: { mb: 2 }, onClose: () => p(null), children: m }),
    v && /* @__PURE__ */ t(J, { severity: "success", sx: { mb: 2 }, onClose: () => S(null), children: v }),
    /* @__PURE__ */ t(f, { sx: { mb: 2 }, children: /* @__PURE__ */ s(Jt, { fullWidth: !0, size: "small", children: [
      /* @__PURE__ */ t(Qt, { children: "Log Source" }),
      /* @__PURE__ */ t(
        Yt,
        {
          value: n,
          label: "Log Source",
          onChange: (E) => o(E.target.value),
          disabled: e.length === 0,
          children: e.map((E) => /* @__PURE__ */ s(we, { value: E.name, children: [
            E.name,
            " (",
            E.type,
            ")"
          ] }, E.name))
        }
      )
    ] }) }),
    c ? /* @__PURE__ */ t(f, { sx: { display: "flex", justifyContent: "center", p: 3 }, children: /* @__PURE__ */ t(re, { size: 30 }) }) : a ? /* @__PURE__ */ s(f, { sx: { mb: 2 }, children: [
      /* @__PURE__ */ s(k, { variant: "body2", color: "text.secondary", children: [
        /* @__PURE__ */ t("strong", { children: "Total Logs:" }),
        " ",
        a.totalLogs.toLocaleString()
      ] }),
      /* @__PURE__ */ s(k, { variant: "body2", color: "text.secondary", children: [
        /* @__PURE__ */ t("strong", { children: "File Size:" }),
        " ",
        a.fileSizeFormatted
      ] }),
      /* @__PURE__ */ t(k, { variant: "body2", color: "text.secondary", sx: { mt: 1 }, children: /* @__PURE__ */ t("strong", { children: "By Level:" }) }),
      /* @__PURE__ */ s(f, { sx: { pl: 2 }, children: [
        /* @__PURE__ */ s(k, { variant: "body2", color: "text.secondary", children: [
          "Debug: ",
          a.byLevel.debug.toLocaleString()
        ] }),
        /* @__PURE__ */ s(k, { variant: "body2", color: "text.secondary", children: [
          "Info: ",
          a.byLevel.info.toLocaleString()
        ] }),
        /* @__PURE__ */ s(k, { variant: "body2", color: "text.secondary", children: [
          "Warn: ",
          a.byLevel.warn.toLocaleString()
        ] }),
        /* @__PURE__ */ s(k, { variant: "body2", color: "error", children: [
          "Error: ",
          a.byLevel.error.toLocaleString()
        ] })
      ] })
    ] }) : null,
    /* @__PURE__ */ s(f, { sx: { display: "flex", gap: 1 }, children: [
      /* @__PURE__ */ t(
        ue,
        {
          variant: "outlined",
          color: "primary",
          size: "small",
          startIcon: /* @__PURE__ */ t(rt, {}),
          onClick: B,
          disabled: !n || c,
          children: "Refresh"
        }
      ),
      /* @__PURE__ */ t(
        ue,
        {
          variant: "contained",
          color: "error",
          size: "small",
          startIcon: h ? /* @__PURE__ */ t(re, { size: 16, color: "inherit" }) : /* @__PURE__ */ t(_t, {}),
          onClick: () => A(!0),
          disabled: !n || h || c,
          children: "Clear Logs"
        }
      )
    ] }),
    /* @__PURE__ */ s(Br, { open: g, onClose: () => A(!1), children: [
      /* @__PURE__ */ t(Or, { children: "Clear Log File" }),
      /* @__PURE__ */ t(Mr, { children: /* @__PURE__ */ s(Mn, { children: [
        'Are you sure you want to clear the "',
        n,
        '" log file? This action cannot be undone.'
      ] }) }),
      /* @__PURE__ */ s(Lr, { children: [
        /* @__PURE__ */ t(ue, { onClick: () => A(!1), children: "Cancel" }),
        /* @__PURE__ */ t(ue, { onClick: O, color: "error", variant: "contained", children: "Clear" })
      ] })
    ] })
  ] }) });
}
function Ms() {
  const [e, r] = y(null), [n, o] = y(!0), [a, i] = y(!1), [c, l] = y(null), [h, u] = y(null), [m, p] = y(!1), v = async () => {
    o(!0), l(null);
    try {
      const g = await fetch("/api/cache:default/stats");
      if (!g.ok)
        throw g.status === 404 ? new Error("Cache plugin not configured") : new Error("Failed to fetch cache stats");
      const A = await g.json();
      r(A);
    } catch (g) {
      l(g instanceof Error ? g.message : "Failed to fetch cache stats"), r(null);
    } finally {
      o(!1);
    }
  };
  te(() => {
    v();
  }, []);
  const S = async () => {
    p(!1), i(!0), l(null), u(null);
    try {
      const g = await fetch("/api/cache:default/flush", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!g.ok) {
        const $ = await g.json();
        throw new Error($.error || "Failed to flush cache");
      }
      const A = await g.json();
      u(
        A.message + (A.deletedCount !== void 0 ? ` (${A.deletedCount} keys deleted)` : "")
      ), await v();
    } catch (g) {
      l(g instanceof Error ? g.message : "Failed to flush cache");
    } finally {
      i(!1);
    }
  };
  return /* @__PURE__ */ t(j, { children: /* @__PURE__ */ s(R, { children: [
    /* @__PURE__ */ t(k, { variant: "h6", gutterBottom: !0, children: "Cache Management" }),
    /* @__PURE__ */ t(k, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "View cache statistics and clear cache" }),
    c && /* @__PURE__ */ t(J, { severity: "error", sx: { mb: 2 }, onClose: () => l(null), children: c }),
    h && /* @__PURE__ */ t(J, { severity: "success", sx: { mb: 2 }, onClose: () => u(null), children: h }),
    n ? /* @__PURE__ */ t(f, { sx: { display: "flex", justifyContent: "center", p: 3 }, children: /* @__PURE__ */ t(re, { size: 30 }) }) : e ? /* @__PURE__ */ s(f, { sx: { mb: 2 }, children: [
      /* @__PURE__ */ s(f, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 1 }, children: [
        /* @__PURE__ */ t(k, { variant: "body2", color: "text.secondary", children: /* @__PURE__ */ t("strong", { children: "Status:" }) }),
        /* @__PURE__ */ t(
          ne,
          {
            size: "small",
            icon: e.connected ? /* @__PURE__ */ t(Ne, {}) : /* @__PURE__ */ t(Pe, {}),
            label: e.connected ? "Connected" : "Disconnected",
            color: e.connected ? "success" : "error"
          }
        )
      ] }),
      /* @__PURE__ */ s(k, { variant: "body2", color: "text.secondary", children: [
        /* @__PURE__ */ t("strong", { children: "Key Count:" }),
        " ",
        e.keyCount.toLocaleString()
      ] }),
      e.usedMemory && /* @__PURE__ */ s(k, { variant: "body2", color: "text.secondary", children: [
        /* @__PURE__ */ t("strong", { children: "Memory Used:" }),
        " ",
        e.usedMemory
      ] })
    ] }) : null,
    /* @__PURE__ */ s(f, { sx: { display: "flex", gap: 1 }, children: [
      /* @__PURE__ */ t(
        ue,
        {
          variant: "outlined",
          color: "primary",
          size: "small",
          startIcon: /* @__PURE__ */ t(rt, {}),
          onClick: v,
          disabled: n,
          children: "Refresh"
        }
      ),
      /* @__PURE__ */ t(
        ue,
        {
          variant: "contained",
          color: "error",
          size: "small",
          startIcon: a ? /* @__PURE__ */ t(re, { size: 16, color: "inherit" }) : /* @__PURE__ */ t(_t, {}),
          onClick: () => p(!0),
          disabled: !e || !e.connected || a || n,
          children: "Flush Cache"
        }
      )
    ] }),
    /* @__PURE__ */ s(Br, { open: m, onClose: () => p(!1), children: [
      /* @__PURE__ */ t(Or, { children: "Flush Cache" }),
      /* @__PURE__ */ t(Mr, { children: /* @__PURE__ */ s(Mn, { children: [
        "Are you sure you want to flush the cache? This will delete",
        " ",
        e == null ? void 0 : e.keyCount.toLocaleString(),
        " keys. This action cannot be undone."
      ] }) }),
      /* @__PURE__ */ s(Lr, { children: [
        /* @__PURE__ */ t(ue, { onClick: () => p(!1), children: "Cancel" }),
        /* @__PURE__ */ t(ue, { onClick: S, color: "error", variant: "contained", children: "Flush" })
      ] })
    ] })
  ] }) });
}
const Sr = 1e5, Nr = 10;
function Dr(e, r = 0) {
  return r > Nr ? !0 : e && typeof e == "object" && !Array.isArray(e) ? Object.values(e).some((n) => Dr(n, r + 1)) : Array.isArray(e) ? e.some((n) => Dr(n, r + 1)) : !1;
}
function Ls() {
  const [e, r] = y("{}"), [n, o] = y(!0), [a, i] = y(!1), [c, l] = y(null), [h, u] = y(!1), [m, p] = y(null), [v, S] = y(!1);
  te(() => {
    (async () => {
      try {
        const N = await K.getPreferences();
        r(JSON.stringify(N.preferences, null, 2)), l(null);
      } catch (N) {
        l(N instanceof Error ? N.message : "Failed to load preferences");
      } finally {
        o(!1);
      }
    })();
  }, []);
  const g = (b) => {
    r(b), S(!0), u(!1);
    try {
      const N = JSON.parse(b);
      if (Dr(N)) {
        p(`Preferences object too deeply nested (max ${Nr} levels)`);
        return;
      }
      p(null);
    } catch (N) {
      p(N instanceof Error ? N.message : "Invalid JSON");
    }
  }, A = async () => {
    if (!m)
      try {
        const b = JSON.parse(e);
        i(!0), l(null);
        const N = await K.updatePreferences(b);
        r(JSON.stringify(N.preferences, null, 2)), u(!0), S(!1);
      } catch (b) {
        l(b instanceof Error ? b.message : "Failed to save preferences");
      } finally {
        i(!1);
      }
  }, $ = async () => {
    if (confirm("Reset all preferences to defaults? This cannot be undone."))
      try {
        i(!0), l(null), await K.deletePreferences();
        const b = await K.getPreferences();
        r(JSON.stringify(b.preferences, null, 2)), u(!0), S(!1);
      } catch (b) {
        l(b instanceof Error ? b.message : "Failed to reset preferences");
      } finally {
        i(!1);
      }
  }, B = () => {
    try {
      const b = JSON.parse(e);
      r(JSON.stringify(b, null, 2)), p(null);
    } catch {
    }
  };
  if (n)
    return /* @__PURE__ */ t(f, { sx: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }, children: /* @__PURE__ */ t(re, {}) });
  const O = e.length, E = O / Sr * 100;
  return /* @__PURE__ */ s(f, { children: [
    /* @__PURE__ */ s(f, { sx: { mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
      /* @__PURE__ */ s(f, { children: [
        /* @__PURE__ */ t(k, { variant: "h4", sx: { color: "var(--theme-text-primary)" }, children: "Preferences" }),
        /* @__PURE__ */ t(k, { variant: "body2", sx: { color: "var(--theme-text-secondary)", mt: 0.5 }, children: "Manage your user preferences as JSON" })
      ] }),
      /* @__PURE__ */ t(f, { sx: { display: "flex", gap: 1 }, children: /* @__PURE__ */ t(
        ne,
        {
          label: `${O.toLocaleString()} / ${Sr.toLocaleString()} bytes`,
          size: "small",
          color: E > 90 ? "error" : E > 75 ? "warning" : "default"
        }
      ) })
    ] }),
    c && /* @__PURE__ */ t(J, { severity: "error", sx: { mb: 2 }, onClose: () => l(null), children: c }),
    h && /* @__PURE__ */ t(J, { severity: "success", sx: { mb: 2 }, onClose: () => u(!1), children: "Preferences saved successfully" }),
    /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)", mb: 2 }, children: /* @__PURE__ */ s(R, { children: [
      /* @__PURE__ */ s(f, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }, children: [
        /* @__PURE__ */ t(k, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: "Preferences JSON" }),
        /* @__PURE__ */ t(
          ie,
          {
            variant: "outlined",
            onClick: B,
            disabled: !!m,
            children: "Format JSON"
          }
        )
      ] }),
      /* @__PURE__ */ t(
        _,
        {
          fullWidth: !0,
          multiline: !0,
          rows: 20,
          value: e,
          onChange: (b) => g(b.target.value),
          error: !!m,
          helperText: m || `Edit your preferences as JSON. Max ${Sr.toLocaleString()} bytes, max ${Nr} levels deep.`,
          sx: {
            "& .MuiInputBase-root": {
              fontFamily: "monospace",
              fontSize: "0.875rem"
            }
          }
        }
      )
    ] }) }),
    /* @__PURE__ */ s(f, { sx: { display: "flex", gap: 2, justifyContent: "flex-end" }, children: [
      /* @__PURE__ */ t(
        ie,
        {
          variant: "outlined",
          onClick: $,
          disabled: a,
          color: "error",
          children: "Reset to Defaults"
        }
      ),
      /* @__PURE__ */ t(
        ie,
        {
          variant: "contained",
          onClick: A,
          disabled: !!m || !v || a,
          loading: a,
          children: "Save Preferences"
        }
      )
    ] })
  ] });
}
function Rs() {
  return [
    { name: "ServiceHealthWidget", component: vs },
    { name: "IntegrationStatusWidget", component: xs },
    { name: "AuthStatusWidget", component: ws },
    { name: "NotificationsStatsWidget", component: $s },
    { name: "CMSStatusWidget", component: Ts },
    { name: "CMSMaintenanceWidget", component: Ps },
    { name: "SeedManagementWidget", component: Ns },
    { name: "ServiceControlWidget", component: Ds },
    { name: "EnvironmentConfigWidget", component: zs },
    { name: "DatabaseOpsWidget", component: Bs },
    { name: "LogsMaintenanceWidget", component: Os },
    { name: "CacheMaintenanceWidget", component: Ms },
    { name: "PreferencesPage", component: Ls }
  ];
}
function js(e) {
  switch (e) {
    case "healthy":
      return /* @__PURE__ */ t(Ne, { sx: { color: "var(--theme-success)" } });
    case "degraded":
      return /* @__PURE__ */ t(jt, { sx: { color: "var(--theme-warning)" } });
    case "unhealthy":
      return /* @__PURE__ */ t(Pe, { sx: { color: "var(--theme-error)" } });
    default:
      return /* @__PURE__ */ t(re, { size: 20 });
  }
}
function kr(e) {
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
function Ws() {
  var v, S;
  const e = Nn(), [r, n] = y(null), [o, a] = y(null), [i, c] = y(!0), [l, h] = y(null);
  if (te(() => {
    const g = async () => {
      try {
        const [$, B] = await Promise.all([
          K.getHealth(),
          K.getInfo()
        ]);
        n($), a(B), h(null);
      } catch ($) {
        h($ instanceof Error ? $.message : "Failed to fetch data");
      } finally {
        c(!1);
      }
    };
    g();
    const A = setInterval(g, 1e4);
    return () => clearInterval(A);
  }, []), i)
    return /* @__PURE__ */ t(f, { sx: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }, children: /* @__PURE__ */ t(re, {}) });
  if (l)
    return /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)", border: "1px solid var(--theme-error)" }, children: /* @__PURE__ */ t(R, { children: /* @__PURE__ */ t(k, { color: "error", children: l }) }) });
  const u = r ? Object.entries(r.checks) : [], m = u.filter(([, g]) => g.status === "healthy").length, p = u.length;
  return /* @__PURE__ */ s(f, { children: [
    /* @__PURE__ */ t(k, { variant: "h4", sx: { mb: 1, color: "var(--theme-text-primary)" }, children: "Dashboard" }),
    /* @__PURE__ */ s(k, { variant: "body2", sx: { mb: 4, color: "var(--theme-text-secondary)" }, children: [
      "Real-time overview of ",
      (o == null ? void 0 : o.product) || "your service"
    ] }),
    /* @__PURE__ */ t(
      j,
      {
        sx: {
          mb: 4,
          bgcolor: "var(--theme-surface)",
          border: `2px solid ${kr((r == null ? void 0 : r.status) || "unknown")}`
        },
        children: /* @__PURE__ */ t(So, { onClick: () => e("/health"), children: /* @__PURE__ */ s(R, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
          /* @__PURE__ */ s(f, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
            js((r == null ? void 0 : r.status) || "unknown"),
            /* @__PURE__ */ s(f, { children: [
              /* @__PURE__ */ s(k, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: [
                "Service Status: ",
                (v = r == null ? void 0 : r.status) == null ? void 0 : v.charAt(0).toUpperCase(),
                (S = r == null ? void 0 : r.status) == null ? void 0 : S.slice(1)
              ] }),
              /* @__PURE__ */ t(k, { variant: "body2", sx: { color: "var(--theme-text-secondary)" }, children: "Click to view detailed health information" })
            ] })
          ] }),
          /* @__PURE__ */ t(
            ne,
            {
              label: `${m}/${p} checks passing`,
              sx: {
                bgcolor: kr((r == null ? void 0 : r.status) || "unknown") + "20",
                color: kr((r == null ? void 0 : r.status) || "unknown")
              }
            }
          )
        ] }) })
      }
    ),
    /* @__PURE__ */ t(gs, { widgetType: "status" }),
    /* @__PURE__ */ t(ms, {})
  ] });
}
const Vr = Y(/* @__PURE__ */ t("path", {
  d: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14"
}), "Search"), Fs = Y(/* @__PURE__ */ t("path", {
  d: "M6 19h4V5H6zm8-14v14h4V5z"
}), "Pause"), Us = Y(/* @__PURE__ */ t("path", {
  d: "m4 12 1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8z"
}), "ArrowUpward"), _s = Y(/* @__PURE__ */ t("path", {
  d: "m20 12-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8z"
}), "ArrowDownward"), Vs = Y(/* @__PURE__ */ t("path", {
  d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m1 15h-2v-6h2zm0-8h-2V7h2z"
}), "Info"), Hs = Y(/* @__PURE__ */ t("path", {
  d: "M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5s-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20zm-6 8h-4v-2h4zm0-4h-4v-2h4z"
}), "BugReport");
function wn(e) {
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
function Ks() {
  const [e, r] = y([]), [n, o] = y([]), [a, i] = y(!0), [c, l] = y(null), [h, u] = y(""), [m, p] = y(""), [v, S] = y(""), [g, A] = y(1), [$, B] = y(0), O = 50, [E, b] = y(!1), [N, T] = y("desc"), V = Co(null), U = {
    total: $,
    errors: e.filter((x) => x.level.toLowerCase() === "error").length,
    warnings: e.filter((x) => ["warn", "warning"].includes(x.level.toLowerCase())).length,
    info: e.filter((x) => x.level.toLowerCase() === "info").length,
    debug: e.filter((x) => x.level.toLowerCase() === "debug").length
  }, L = be(async () => {
    i(!0);
    try {
      const x = await K.getLogs({
        source: h || void 0,
        level: m || void 0,
        search: v || void 0,
        limit: O,
        page: g
      }), M = [...x.logs].sort((W, oe) => {
        const H = new Date(W.timestamp).getTime(), pe = new Date(oe.timestamp).getTime();
        return N === "desc" ? pe - H : H - pe;
      });
      r(M), B(x.total), l(null);
    } catch (x) {
      l(x instanceof Error ? x.message : "Failed to fetch logs");
    } finally {
      i(!1);
    }
  }, [h, m, v, g, N]), de = async () => {
    try {
      const x = await K.getLogSources();
      o(x);
    } catch {
    }
  };
  te(() => {
    de();
  }, []), te(() => {
    L();
  }, [L]), te(() => (E ? V.current = setInterval(L, 5e3) : V.current && (clearInterval(V.current), V.current = null), () => {
    V.current && clearInterval(V.current);
  }), [E, L]);
  const G = () => {
    A(1), L();
  }, d = (x, M) => {
    M !== null && T(M);
  }, P = Math.ceil($ / O);
  return /* @__PURE__ */ s(f, { children: [
    /* @__PURE__ */ t(k, { variant: "h4", sx: { mb: 1, color: "var(--theme-text-primary)" }, children: "Logs" }),
    /* @__PURE__ */ t(k, { variant: "body2", sx: { mb: 4, color: "var(--theme-text-secondary)" }, children: "View and search application logs" }),
    /* @__PURE__ */ s(Se, { container: !0, spacing: 2, sx: { mb: 3 }, children: [
      /* @__PURE__ */ t(Se, { size: { xs: 6, sm: 3, md: 2.4 }, children: /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ s(R, { sx: { py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }, children: [
        /* @__PURE__ */ t(f, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: /* @__PURE__ */ t(k, { variant: "h5", sx: { color: "var(--theme-text-primary)", fontWeight: 600 }, children: U.total.toLocaleString() }) }),
        /* @__PURE__ */ t(k, { variant: "caption", sx: { color: "var(--theme-text-secondary)" }, children: "Total Logs" })
      ] }) }) }),
      /* @__PURE__ */ t(Se, { size: { xs: 6, sm: 3, md: 2.4 }, children: /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ s(R, { sx: { py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }, children: [
        /* @__PURE__ */ s(f, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
          /* @__PURE__ */ t(Pe, { sx: { color: "var(--theme-error)", fontSize: 20 } }),
          /* @__PURE__ */ t(k, { variant: "h5", sx: { color: "var(--theme-error)", fontWeight: 600 }, children: U.errors })
        ] }),
        /* @__PURE__ */ t(k, { variant: "caption", sx: { color: "var(--theme-text-secondary)" }, children: "Errors" })
      ] }) }) }),
      /* @__PURE__ */ t(Se, { size: { xs: 6, sm: 3, md: 2.4 }, children: /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ s(R, { sx: { py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }, children: [
        /* @__PURE__ */ s(f, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
          /* @__PURE__ */ t(jt, { sx: { color: "var(--theme-warning)", fontSize: 20 } }),
          /* @__PURE__ */ t(k, { variant: "h5", sx: { color: "var(--theme-warning)", fontWeight: 600 }, children: U.warnings })
        ] }),
        /* @__PURE__ */ t(k, { variant: "caption", sx: { color: "var(--theme-text-secondary)" }, children: "Warnings" })
      ] }) }) }),
      /* @__PURE__ */ t(Se, { size: { xs: 6, sm: 3, md: 2.4 }, children: /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ s(R, { sx: { py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }, children: [
        /* @__PURE__ */ s(f, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
          /* @__PURE__ */ t(Vs, { sx: { color: "var(--theme-info)", fontSize: 20 } }),
          /* @__PURE__ */ t(k, { variant: "h5", sx: { color: "var(--theme-info)", fontWeight: 600 }, children: U.info })
        ] }),
        /* @__PURE__ */ t(k, { variant: "caption", sx: { color: "var(--theme-text-secondary)" }, children: "Info" })
      ] }) }) }),
      /* @__PURE__ */ t(Se, { size: { xs: 6, sm: 3, md: 2.4 }, children: /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ s(R, { sx: { py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }, children: [
        /* @__PURE__ */ s(f, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
          /* @__PURE__ */ t(Hs, { sx: { color: "var(--theme-text-secondary)", fontSize: 20 } }),
          /* @__PURE__ */ t(k, { variant: "h5", sx: { color: "var(--theme-text-primary)", fontWeight: 600 }, children: U.debug })
        ] }),
        /* @__PURE__ */ t(k, { variant: "caption", sx: { color: "var(--theme-text-secondary)" }, children: "Debug" })
      ] }) }) })
    ] }),
    /* @__PURE__ */ t(j, { sx: { mb: 3, bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(R, { children: /* @__PURE__ */ s(f, { sx: { display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }, children: [
      n.length > 0 && /* @__PURE__ */ s(Jt, { size: "small", sx: { minWidth: 150 }, children: [
        /* @__PURE__ */ t(Qt, { sx: { color: "var(--theme-text-secondary)" }, children: "Source" }),
        /* @__PURE__ */ s(
          Yt,
          {
            value: h,
            label: "Source",
            onChange: (x) => u(x.target.value),
            sx: { color: "var(--theme-text-primary)" },
            children: [
              /* @__PURE__ */ t(we, { value: "", children: "All Sources" }),
              n.map((x) => /* @__PURE__ */ t(we, { value: x.name, children: x.name }, x.name))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ s(Jt, { size: "small", sx: { minWidth: 120 }, children: [
        /* @__PURE__ */ t(Qt, { sx: { color: "var(--theme-text-secondary)" }, children: "Level" }),
        /* @__PURE__ */ s(
          Yt,
          {
            value: m,
            label: "Level",
            onChange: (x) => p(x.target.value),
            sx: { color: "var(--theme-text-primary)" },
            children: [
              /* @__PURE__ */ t(we, { value: "", children: "All Levels" }),
              /* @__PURE__ */ t(we, { value: "error", children: "Error" }),
              /* @__PURE__ */ t(we, { value: "warn", children: "Warning" }),
              /* @__PURE__ */ t(we, { value: "info", children: "Info" }),
              /* @__PURE__ */ t(we, { value: "debug", children: "Debug" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ t(
        _,
        {
          size: "small",
          placeholder: "Search logs...",
          value: v,
          onChange: (x) => S(x.target.value),
          onKeyPress: (x) => x.key === "Enter" && G(),
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
      /* @__PURE__ */ s(
        ko,
        {
          value: N,
          exclusive: !0,
          onChange: d,
          size: "small",
          "aria-label": "sort order",
          children: [
            /* @__PURE__ */ t(Xr, { value: "desc", "aria-label": "newest first", children: /* @__PURE__ */ t(Ee, { title: "Newest First", children: /* @__PURE__ */ t(_s, { fontSize: "small" }) }) }),
            /* @__PURE__ */ t(Xr, { value: "asc", "aria-label": "oldest first", children: /* @__PURE__ */ t(Ee, { title: "Oldest First", children: /* @__PURE__ */ t(Us, { fontSize: "small" }) }) })
          ]
        }
      ),
      /* @__PURE__ */ t(Ee, { title: E ? "Pause auto-refresh" : "Enable auto-refresh (5s)", children: /* @__PURE__ */ t(
        Ae,
        {
          onClick: () => b(!E),
          sx: {
            color: E ? "var(--theme-success)" : "var(--theme-text-secondary)",
            bgcolor: E ? "var(--theme-success)20" : "transparent"
          },
          children: E ? /* @__PURE__ */ t(Fs, {}) : /* @__PURE__ */ t(Wt, {})
        }
      ) }),
      /* @__PURE__ */ t(Ee, { title: "Refresh", children: /* @__PURE__ */ t(Ae, { onClick: L, sx: { color: "var(--theme-primary)" }, children: /* @__PURE__ */ t(rt, {}) }) })
    ] }) }) }),
    c && /* @__PURE__ */ t(j, { sx: { mb: 3, bgcolor: "var(--theme-surface)", border: "1px solid var(--theme-error)" }, children: /* @__PURE__ */ t(R, { children: /* @__PURE__ */ t(k, { color: "error", children: c }) }) }),
    /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)" }, children: a ? /* @__PURE__ */ t(f, { sx: { display: "flex", justifyContent: "center", p: 4 }, children: /* @__PURE__ */ t(re, {}) }) : e.length === 0 ? /* @__PURE__ */ t(R, { children: /* @__PURE__ */ t(k, { sx: { color: "var(--theme-text-secondary)", textAlign: "center" }, children: "No logs found" }) }) : /* @__PURE__ */ s(Fe, { children: [
      /* @__PURE__ */ t(Qe, { children: /* @__PURE__ */ s(Ye, { size: "small", children: [
        /* @__PURE__ */ t(Xe, { children: /* @__PURE__ */ s(fe, { children: [
          /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", width: 180 }, children: "Timestamp" }),
          /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", width: 100 }, children: "Level" }),
          /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", width: 120 }, children: "Component" }),
          /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Message" })
        ] }) }),
        /* @__PURE__ */ t(Ze, { children: e.map((x, M) => /* @__PURE__ */ s(fe, { hover: !0, children: [
          /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", fontFamily: "monospace", fontSize: "0.75rem" }, children: new Date(x.timestamp).toLocaleString() }),
          /* @__PURE__ */ t(D, { sx: { borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(
            ne,
            {
              label: x.level.toUpperCase(),
              size: "small",
              sx: {
                bgcolor: wn(x.level) + "20",
                color: wn(x.level),
                fontSize: "0.65rem",
                height: 20
              }
            }
          ) }),
          /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", fontSize: "0.75rem" }, children: x.namespace || "-" }),
          /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)", fontFamily: "monospace", fontSize: "0.8rem", whiteSpace: "pre-wrap", wordBreak: "break-all" }, children: x.message })
        ] }, M)) })
      ] }) }),
      P > 1 && /* @__PURE__ */ t(f, { sx: { display: "flex", justifyContent: "center", p: 2 }, children: /* @__PURE__ */ t(
        Eo,
        {
          count: P,
          page: g,
          onChange: (x, M) => A(M),
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
const Hr = Y(/* @__PURE__ */ t("path", {
  d: "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m0 16H8V7h11z"
}), "ContentCopy"), Gs = Y(/* @__PURE__ */ t("path", {
  d: "M15 9H9v6h6zm-2 4h-2v-2h2zm8-2V9h-2V7c0-1.1-.9-2-2-2h-2V3h-2v2h-2V3H9v2H7c-1.1 0-2 .9-2 2v2H3v2h2v2H3v2h2v2c0 1.1.9 2 2 2h2v2h2v-2h2v2h2v-2h2c1.1 0 2-.9 2-2v-2h2v-2h-2v-2zm-4 6H7V7h10z"
}), "Memory"), qs = Y(/* @__PURE__ */ t("path", {
  d: "M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2zM4 6h16v10H4z"
}), "Computer"), Js = Y(/* @__PURE__ */ t("path", {
  d: "M2 20h20v-4H2zm2-3h2v2H4zM2 4v4h20V4zm4 3H4V5h2zm-4 7h20v-4H2zm2-3h2v2H4z"
}), "Storage"), Qs = Y([/* @__PURE__ */ t("path", {
  d: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8"
}, "0"), /* @__PURE__ */ t("path", {
  d: "M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"
}, "1")], "AccessTime"), Ys = Y(/* @__PURE__ */ t("path", {
  d: "m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z"
}), "Favorite");
function Er(e) {
  if (e === 0) return "0 B";
  const r = 1024, n = ["B", "KB", "MB", "GB"], o = Math.floor(Math.log(e) / Math.log(r));
  return parseFloat((e / Math.pow(r, o)).toFixed(2)) + " " + n[o];
}
function Xs(e) {
  const r = Math.floor(e / 1e3), n = Math.floor(r / 60), o = Math.floor(n / 60), a = Math.floor(o / 24);
  return a > 0 ? `${a}d ${o % 24}h ${n % 60}m` : o > 0 ? `${o}h ${n % 60}m ${r % 60}s` : n > 0 ? `${n}m ${r % 60}s` : `${r}s`;
}
function Zs(e, r = 20) {
  switch (e) {
    case "healthy":
      return /* @__PURE__ */ t(Ne, { sx: { color: "var(--theme-success)", fontSize: r } });
    case "degraded":
      return /* @__PURE__ */ t(jt, { sx: { color: "var(--theme-warning)", fontSize: r } });
    case "unhealthy":
      return /* @__PURE__ */ t(Pe, { sx: { color: "var(--theme-error)", fontSize: r } });
    default:
      return /* @__PURE__ */ t(re, { size: r });
  }
}
function Dt(e) {
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
function el(e) {
  return e === void 0 ? "-" : e < 1e3 ? `${e}ms` : `${(e / 1e3).toFixed(2)}s`;
}
function tl() {
  const [e, r] = y(null), [n, o] = y(null), [a, i] = y(!0), [c, l] = y(null), [h, u] = y({
    open: !1,
    message: ""
  }), m = async () => {
    i(!0);
    try {
      const [S, g] = await Promise.all([
        K.getDiagnostics(),
        K.getHealth().catch(() => null)
        // Health might not be available
      ]);
      r(S), o(g), l(null);
    } catch (S) {
      l(S instanceof Error ? S.message : "Failed to fetch diagnostics");
    } finally {
      i(!1);
    }
  };
  te(() => {
    m();
    const S = setInterval(m, 3e4);
    return () => clearInterval(S);
  }, []);
  const p = () => {
    navigator.clipboard.writeText(JSON.stringify(e, null, 2)), u({ open: !0, message: "Diagnostics copied to clipboard" });
  };
  if (a && !e)
    return /* @__PURE__ */ t(f, { sx: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }, children: /* @__PURE__ */ t(re, {}) });
  if (c)
    return /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)", border: "1px solid var(--theme-error)" }, children: /* @__PURE__ */ t(R, { children: /* @__PURE__ */ t(k, { color: "error", children: c }) }) });
  const v = e ? e.system.memory.used / e.system.memory.total * 100 : 0;
  return /* @__PURE__ */ s(f, { children: [
    /* @__PURE__ */ s(f, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }, children: [
      /* @__PURE__ */ t(k, { variant: "h4", sx: { color: "var(--theme-text-primary)" }, children: "System" }),
      /* @__PURE__ */ s(f, { sx: { display: "flex", gap: 1 }, children: [
        /* @__PURE__ */ t(Ee, { title: "Copy diagnostics JSON", children: /* @__PURE__ */ t(Ae, { onClick: p, sx: { color: "var(--theme-primary)" }, children: /* @__PURE__ */ t(Hr, {}) }) }),
        /* @__PURE__ */ t(Ee, { title: "Refresh", children: /* @__PURE__ */ t(Ae, { onClick: m, sx: { color: "var(--theme-primary)" }, children: /* @__PURE__ */ t(rt, {}) }) })
      ] })
    ] }),
    /* @__PURE__ */ t(k, { variant: "body2", sx: { mb: 4, color: "var(--theme-text-secondary)" }, children: "System information and diagnostics" }),
    /* @__PURE__ */ s(Se, { container: !0, spacing: 3, children: [
      /* @__PURE__ */ t(Se, { size: { xs: 12, md: 6 }, children: /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)", height: "100%" }, children: /* @__PURE__ */ s(R, { children: [
        /* @__PURE__ */ s(f, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 3 }, children: [
          /* @__PURE__ */ t(qs, { sx: { color: "var(--theme-primary)" } }),
          /* @__PURE__ */ t(k, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: "System Information" })
        ] }),
        /* @__PURE__ */ s(f, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: [
          /* @__PURE__ */ s(f, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(k, { sx: { color: "var(--theme-text-secondary)" }, children: "QwickApps Server" }),
            /* @__PURE__ */ t(
              ne,
              {
                label: e != null && e.frameworkVersion ? `v${e.frameworkVersion}` : "N/A",
                size: "small",
                sx: { bgcolor: "var(--theme-primary)20", color: "var(--theme-primary)" }
              }
            )
          ] }),
          /* @__PURE__ */ s(f, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(k, { sx: { color: "var(--theme-text-secondary)" }, children: "Node.js" }),
            /* @__PURE__ */ t(
              ne,
              {
                label: e == null ? void 0 : e.system.nodeVersion,
                size: "small",
                sx: { bgcolor: "var(--theme-background)", color: "var(--theme-text-primary)" }
              }
            )
          ] }),
          /* @__PURE__ */ s(f, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(k, { sx: { color: "var(--theme-text-secondary)" }, children: "Platform" }),
            /* @__PURE__ */ t(
              ne,
              {
                label: e == null ? void 0 : e.system.platform,
                size: "small",
                sx: { bgcolor: "var(--theme-background)", color: "var(--theme-text-primary)" }
              }
            )
          ] }),
          /* @__PURE__ */ s(f, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(k, { sx: { color: "var(--theme-text-secondary)" }, children: "Architecture" }),
            /* @__PURE__ */ t(
              ne,
              {
                label: e == null ? void 0 : e.system.arch,
                size: "small",
                sx: { bgcolor: "var(--theme-background)", color: "var(--theme-text-primary)" }
              }
            )
          ] })
        ] })
      ] }) }) }),
      /* @__PURE__ */ t(Se, { size: { xs: 12, md: 6 }, children: /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)", height: "100%" }, children: /* @__PURE__ */ s(R, { children: [
        /* @__PURE__ */ s(f, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 3 }, children: [
          /* @__PURE__ */ t(Gs, { sx: { color: "var(--theme-warning)" } }),
          /* @__PURE__ */ t(k, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: "Memory Usage" })
        ] }),
        /* @__PURE__ */ s(f, { sx: { mb: 2 }, children: [
          /* @__PURE__ */ s(f, { sx: { display: "flex", justifyContent: "space-between", mb: 1 }, children: [
            /* @__PURE__ */ t(k, { sx: { color: "var(--theme-text-secondary)" }, children: "Heap Used" }),
            /* @__PURE__ */ t(k, { sx: { color: "var(--theme-text-primary)" }, children: Er((e == null ? void 0 : e.system.memory.used) || 0) })
          ] }),
          /* @__PURE__ */ t(
            tr,
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
        /* @__PURE__ */ s(f, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: [
          /* @__PURE__ */ s(f, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(k, { sx: { color: "var(--theme-text-secondary)" }, children: "Heap Total" }),
            /* @__PURE__ */ t(k, { sx: { color: "var(--theme-text-primary)" }, children: Er((e == null ? void 0 : e.system.memory.total) || 0) })
          ] }),
          /* @__PURE__ */ s(f, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(k, { sx: { color: "var(--theme-text-secondary)" }, children: "Heap Free" }),
            /* @__PURE__ */ t(k, { sx: { color: "var(--theme-text-primary)" }, children: Er((e == null ? void 0 : e.system.memory.free) || 0) })
          ] })
        ] })
      ] }) }) }),
      /* @__PURE__ */ t(Se, { size: { xs: 12, md: 6 }, children: /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)", height: "100%" }, children: /* @__PURE__ */ s(R, { children: [
        /* @__PURE__ */ s(f, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 3 }, children: [
          /* @__PURE__ */ t(Js, { sx: { color: "var(--theme-info)" } }),
          /* @__PURE__ */ t(k, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: "Service Info" })
        ] }),
        /* @__PURE__ */ s(f, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: [
          /* @__PURE__ */ s(f, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(k, { sx: { color: "var(--theme-text-secondary)" }, children: "Product" }),
            /* @__PURE__ */ t(k, { sx: { color: "var(--theme-text-primary)" }, children: e == null ? void 0 : e.product })
          ] }),
          /* @__PURE__ */ s(f, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(k, { sx: { color: "var(--theme-text-secondary)" }, children: "Version" }),
            /* @__PURE__ */ t(
              ne,
              {
                label: (e == null ? void 0 : e.version) || "N/A",
                size: "small",
                sx: { bgcolor: "var(--theme-primary)20", color: "var(--theme-primary)" }
              }
            )
          ] }),
          /* @__PURE__ */ s(f, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(k, { sx: { color: "var(--theme-text-secondary)" }, children: "Timestamp" }),
            /* @__PURE__ */ t(k, { sx: { color: "var(--theme-text-primary)", fontSize: "0.875rem" }, children: e != null && e.timestamp ? new Date(e.timestamp).toLocaleString() : "N/A" })
          ] })
        ] })
      ] }) }) }),
      /* @__PURE__ */ t(Se, { size: { xs: 12, md: 6 }, children: /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)", height: "100%" }, children: /* @__PURE__ */ s(R, { children: [
        /* @__PURE__ */ s(f, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 3 }, children: [
          /* @__PURE__ */ t(Qs, { sx: { color: "var(--theme-success)" } }),
          /* @__PURE__ */ t(k, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: "Uptime" })
        ] }),
        /* @__PURE__ */ t(k, { variant: "h3", sx: { color: "var(--theme-success)", mb: 1 }, children: Xs((e == null ? void 0 : e.uptime) || 0) }),
        /* @__PURE__ */ t(k, { sx: { color: "var(--theme-text-secondary)" }, children: "Service has been running without interruption" })
      ] }) }) }),
      n && /* @__PURE__ */ t(Se, { size: { xs: 12 }, children: /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ s(R, { children: [
        /* @__PURE__ */ s(f, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 3 }, children: [
          /* @__PURE__ */ t(Ys, { sx: { color: Dt(n.status) } }),
          /* @__PURE__ */ t(k, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: "Health Checks" }),
          /* @__PURE__ */ t(
            ne,
            {
              label: n.status,
              size: "small",
              sx: {
                bgcolor: Dt(n.status) + "20",
                color: Dt(n.status),
                textTransform: "capitalize",
                ml: "auto"
              }
            }
          )
        ] }),
        /* @__PURE__ */ t(Qe, { children: /* @__PURE__ */ s(Ye, { size: "small", children: [
          /* @__PURE__ */ t(Xe, { children: /* @__PURE__ */ s(fe, { children: [
            /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Check" }),
            /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Status" }),
            /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Latency" }),
            /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Last Checked" })
          ] }) }),
          /* @__PURE__ */ t(Ze, { children: Object.entries(n.checks).map(([S, g]) => /* @__PURE__ */ s(fe, { children: [
            /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ s(f, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
              Zs(g.status),
              /* @__PURE__ */ t(k, { fontWeight: 500, children: S })
            ] }) }),
            /* @__PURE__ */ t(D, { sx: { borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(
              ne,
              {
                label: g.status,
                size: "small",
                sx: {
                  bgcolor: Dt(g.status) + "20",
                  color: Dt(g.status),
                  textTransform: "capitalize"
                }
              }
            ) }),
            /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)" }, children: el(g.latency) }),
            /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: new Date(g.lastChecked).toLocaleTimeString() })
          ] }, S)) })
        ] }) })
      ] }) }) }),
      /* @__PURE__ */ t(Se, { size: { xs: 12 }, children: /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ s(R, { children: [
        /* @__PURE__ */ t(k, { variant: "h6", sx: { color: "var(--theme-text-primary)", mb: 2 }, children: "Raw Diagnostics JSON (for AI agents)" }),
        /* @__PURE__ */ t(
          f,
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
      Io,
      {
        open: h.open,
        autoHideDuration: 2e3,
        onClose: () => u({ ...h, open: !1 }),
        anchorOrigin: { vertical: "bottom", horizontal: "center" },
        children: /* @__PURE__ */ t(J, { severity: "success", variant: "filled", children: h.message })
      }
    )
  ] });
}
const zr = Y(/* @__PURE__ */ t("path", {
  d: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z"
}), "Edit"), rl = Y(/* @__PURE__ */ t("path", {
  d: "M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3m3-10H5V5h10z"
}), "Save"), nl = Y(/* @__PURE__ */ t("path", {
  d: "M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2m5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12z"
}), "Cancel"), ol = Y(/* @__PURE__ */ t("path", {
  d: "M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z"
}), "ExpandMore"), al = Y(/* @__PURE__ */ t("path", {
  d: "m12 8-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"
}), "ExpandLess");
function Sn(e) {
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
function il(e) {
  switch (e) {
    case "enabled":
      return /* @__PURE__ */ t(Ne, { sx: { color: "var(--theme-success)" } });
    case "error":
      return /* @__PURE__ */ t(Pe, { sx: { color: "var(--theme-error)" } });
    case "disabled":
    default:
      return /* @__PURE__ */ t(_r, { sx: { color: "var(--theme-text-secondary)" } });
  }
}
const kn = {
  domain: "",
  clientId: "",
  clientSecret: "",
  baseUrl: "",
  secret: "",
  audience: "",
  scopes: ["openid", "profile", "email"],
  allowedRoles: [],
  allowedDomains: []
}, En = {
  url: "",
  anonKey: ""
}, In = {
  username: "",
  password: "",
  realm: "Protected Area"
}, $n = {
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
function sl() {
  var xt, Ge, Ct;
  const [e, r] = y(null), [n, o] = y(!0), [a, i] = y(null), [c, l] = y(null), [h, u] = y(!1), [m, p] = y(!1), [v, S] = y(!1), [g, A] = y(null), [$, B] = y(""), [O, E] = y(kn), [b, N] = y(En), [T, V] = y(In), [U, L] = y($n), [de, G] = y(!0), [d, P] = y(""), [x, M] = y({
    enabled: !1,
    clientId: "",
    clientSecret: ""
  }), [W, oe] = y({
    enabled: !1,
    clientId: "",
    clientSecret: ""
  }), [H, pe] = y({
    enabled: !1,
    clientId: "",
    clientSecret: "",
    keyId: "",
    teamId: ""
  }), [ve, bt] = y(!1), [ge, he] = y(!1), z = be(async () => {
    var I, q, ze, wt;
    o(!0), i(null);
    try {
      const ye = await K.getAuthConfig();
      if (r(ye), ye.runtimeConfig) {
        const Ce = ye.runtimeConfig;
        if (B(Ce.adapter || ""), G(Ce.settings.authRequired ?? !0), P(((I = Ce.settings.excludePaths) == null ? void 0 : I.join(", ")) || ""), Ce.config.auth0 && E({ ...kn, ...Ce.config.auth0 }), Ce.config.supabase && N({ ...En, ...Ce.config.supabase }), Ce.config.basic && V({ ...In, ...Ce.config.basic }), Ce.config.supertokens) {
          const xe = Ce.config.supertokens;
          L({ ...$n, ...xe }), (q = xe.socialProviders) != null && q.google && M({
            enabled: !0,
            clientId: xe.socialProviders.google.clientId,
            clientSecret: xe.socialProviders.google.clientSecret
          }), (ze = xe.socialProviders) != null && ze.github && oe({
            enabled: !0,
            clientId: xe.socialProviders.github.clientId,
            clientSecret: xe.socialProviders.github.clientSecret
          }), (wt = xe.socialProviders) != null && wt.apple && pe({
            enabled: !0,
            clientId: xe.socialProviders.apple.clientId,
            clientSecret: xe.socialProviders.apple.clientSecret,
            keyId: xe.socialProviders.apple.keyId,
            teamId: xe.socialProviders.apple.teamId
          });
        }
      } else ye.adapter && B(ye.adapter);
    } catch (ye) {
      i(ye instanceof Error ? ye.message : "Failed to fetch auth status");
    } finally {
      o(!1);
    }
  }, []);
  te(() => {
    z();
  }, [z]);
  const Oe = (I, q) => {
    navigator.clipboard.writeText(q), l(I), setTimeout(() => l(null), 2e3);
  }, Ke = () => {
    u(!0), A(null);
  }, me = () => {
    u(!1), A(null), z();
  }, De = (I) => JSON.parse(JSON.stringify(I)), je = () => {
    switch ($) {
      case "auth0":
        return De(O);
      case "supabase":
        return De(b);
      case "basic":
        return De(T);
      case "supertokens": {
        const I = { ...U }, q = {};
        return x.enabled && (q.google = {
          clientId: x.clientId,
          clientSecret: x.clientSecret
        }), W.enabled && (q.github = {
          clientId: W.clientId,
          clientSecret: W.clientSecret
        }), H.enabled && (q.apple = {
          clientId: H.clientId,
          clientSecret: H.clientSecret,
          keyId: H.keyId || "",
          teamId: H.teamId || ""
        }), Object.keys(q).length > 0 && (I.socialProviders = q), De(I);
      }
      default:
        return {};
    }
  }, Vt = async () => {
    if ($) {
      S(!0), A(null);
      try {
        const I = await K.testAuthProvider({
          adapter: $,
          config: je()
        });
        A(I);
      } catch (I) {
        A({
          success: !1,
          message: I instanceof Error ? I.message : "Test failed"
        });
      } finally {
        S(!1);
      }
    }
  }, gr = async () => {
    if (e != null && e.adapter) {
      S(!0), A(null);
      try {
        const I = await K.testCurrentAuthProvider();
        A(I);
      } catch (I) {
        A({
          success: !1,
          message: I instanceof Error ? I.message : "Test failed"
        });
      } finally {
        S(!1);
      }
    }
  }, vt = async () => {
    if ($) {
      p(!0), i(null);
      try {
        const I = {
          adapter: $,
          config: je(),
          settings: {
            authRequired: de,
            excludePaths: d.split(",").map((q) => q.trim()).filter(Boolean)
          }
        };
        await K.updateAuthConfig(I), u(!1), await z();
      } catch (I) {
        i(I instanceof Error ? I.message : "Failed to save configuration");
      } finally {
        p(!1);
      }
    }
  }, nt = async () => {
    p(!0), i(null);
    try {
      await K.deleteAuthConfig(), he(!1), u(!1), await z();
    } catch (I) {
      i(I instanceof Error ? I.message : "Failed to delete configuration");
    } finally {
      p(!1);
    }
  };
  if (n)
    return /* @__PURE__ */ t(f, { sx: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }, children: /* @__PURE__ */ t(re, {}) });
  const ot = e != null && e.config ? Object.entries(e.config) : [];
  return /* @__PURE__ */ s(f, { children: [
    /* @__PURE__ */ s(f, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }, children: [
      /* @__PURE__ */ t(k, { variant: "h4", sx: { color: "var(--theme-text-primary)" }, children: "Authentication" }),
      /* @__PURE__ */ t(f, { sx: { display: "flex", gap: 1 }, children: !h && /* @__PURE__ */ s(Fe, { children: [
        /* @__PURE__ */ t(Ee, { title: "Edit Configuration", children: /* @__PURE__ */ t(Ae, { onClick: Ke, sx: { color: "var(--theme-primary)" }, children: /* @__PURE__ */ t(zr, {}) }) }),
        /* @__PURE__ */ t(Ee, { title: "Refresh", children: /* @__PURE__ */ t(Ae, { onClick: z, sx: { color: "var(--theme-text-secondary)" }, children: /* @__PURE__ */ t(rt, {}) }) })
      ] }) })
    ] }),
    /* @__PURE__ */ t(k, { variant: "body2", sx: { mb: 4, color: "var(--theme-text-secondary)" }, children: h ? "Configure authentication provider" : "Auth plugin configuration status" }),
    a && /* @__PURE__ */ t(J, { severity: "error", sx: { mb: 2 }, onClose: () => i(null), children: a }),
    h ? /* @__PURE__ */ s(f, { children: [
      /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)", mb: 3 }, children: /* @__PURE__ */ s(R, { children: [
        /* @__PURE__ */ t(k, { variant: "h6", sx: { color: "var(--theme-text-primary)", mb: 2 }, children: "Provider Selection" }),
        /* @__PURE__ */ s(Jt, { fullWidth: !0, sx: { mb: 2 }, children: [
          /* @__PURE__ */ t(Qt, { sx: { color: "var(--theme-text-secondary)" }, children: "Auth Provider" }),
          /* @__PURE__ */ s(
            Yt,
            {
              value: $,
              onChange: (I) => B(I.target.value),
              label: "Auth Provider",
              sx: { color: "var(--theme-text-primary)" },
              children: [
                /* @__PURE__ */ t(we, { value: "", children: /* @__PURE__ */ t("em", { children: "None (Disabled)" }) }),
                /* @__PURE__ */ t(we, { value: "supertokens", children: "SuperTokens" }),
                /* @__PURE__ */ t(we, { value: "auth0", children: "Auth0" }),
                /* @__PURE__ */ t(we, { value: "supabase", children: "Supabase" }),
                /* @__PURE__ */ t(we, { value: "basic", children: "Basic Auth" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ s(f, { sx: { display: "flex", gap: 2, alignItems: "center" }, children: [
          /* @__PURE__ */ t(
            Tt,
            {
              control: /* @__PURE__ */ t(
                Pt,
                {
                  checked: de,
                  onChange: (I) => G(I.target.checked),
                  sx: { "& .MuiSwitch-switchBase.Mui-checked": { color: "var(--theme-primary)" } }
                }
              ),
              label: "Auth Required",
              sx: { color: "var(--theme-text-primary)" }
            }
          ),
          /* @__PURE__ */ t(
            _,
            {
              label: "Exclude Paths (comma-separated)",
              value: d,
              onChange: (I) => P(I.target.value),
              size: "small",
              sx: { flex: 1, "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } },
              placeholder: "/api/health, /api/public/*"
            }
          )
        ] })
      ] }) }),
      $ === "auth0" && /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)", mb: 3 }, children: /* @__PURE__ */ s(R, { children: [
        /* @__PURE__ */ t(k, { variant: "h6", sx: { color: "var(--theme-text-primary)", mb: 2 }, children: "Auth0 Configuration" }),
        /* @__PURE__ */ s(f, { sx: { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }, children: [
          /* @__PURE__ */ t(
            _,
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
            _,
            {
              label: "Client ID",
              value: O.clientId,
              onChange: (I) => E({ ...O, clientId: I.target.value }),
              required: !0,
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          ),
          /* @__PURE__ */ t(
            _,
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
            _,
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
            _,
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
            _,
            {
              label: "API Audience (optional)",
              value: O.audience || "",
              onChange: (I) => E({ ...O, audience: I.target.value }),
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          )
        ] })
      ] }) }),
      $ === "supabase" && /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)", mb: 3 }, children: /* @__PURE__ */ s(R, { children: [
        /* @__PURE__ */ t(k, { variant: "h6", sx: { color: "var(--theme-text-primary)", mb: 2 }, children: "Supabase Configuration" }),
        /* @__PURE__ */ s(f, { sx: { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }, children: [
          /* @__PURE__ */ t(
            _,
            {
              label: "Project URL",
              value: b.url,
              onChange: (I) => N({ ...b, url: I.target.value }),
              required: !0,
              placeholder: "https://your-project.supabase.co",
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          ),
          /* @__PURE__ */ t(
            _,
            {
              label: "Anon Key",
              type: "password",
              value: b.anonKey,
              onChange: (I) => N({ ...b, anonKey: I.target.value }),
              required: !0,
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          )
        ] })
      ] }) }),
      $ === "basic" && /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)", mb: 3 }, children: /* @__PURE__ */ s(R, { children: [
        /* @__PURE__ */ t(k, { variant: "h6", sx: { color: "var(--theme-text-primary)", mb: 2 }, children: "Basic Auth Configuration" }),
        /* @__PURE__ */ s(f, { sx: { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2 }, children: [
          /* @__PURE__ */ t(
            _,
            {
              label: "Username",
              value: T.username,
              onChange: (I) => V({ ...T, username: I.target.value }),
              required: !0,
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          ),
          /* @__PURE__ */ t(
            _,
            {
              label: "Password",
              type: "password",
              value: T.password,
              onChange: (I) => V({ ...T, password: I.target.value }),
              required: !0,
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          ),
          /* @__PURE__ */ t(
            _,
            {
              label: "Realm (optional)",
              value: T.realm || "",
              onChange: (I) => V({ ...T, realm: I.target.value }),
              placeholder: "Protected Area",
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          )
        ] })
      ] }) }),
      $ === "supertokens" && /* @__PURE__ */ s(Fe, { children: [
        /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)", mb: 3 }, children: /* @__PURE__ */ s(R, { children: [
          /* @__PURE__ */ t(k, { variant: "h6", sx: { color: "var(--theme-text-primary)", mb: 2 }, children: "SuperTokens Configuration" }),
          /* @__PURE__ */ s(f, { sx: { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }, children: [
            /* @__PURE__ */ t(
              _,
              {
                label: "Connection URI",
                value: U.connectionUri,
                onChange: (I) => L({ ...U, connectionUri: I.target.value }),
                required: !0,
                placeholder: "http://localhost:3567",
                sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
              }
            ),
            /* @__PURE__ */ t(
              _,
              {
                label: "API Key (optional)",
                type: "password",
                value: U.apiKey || "",
                onChange: (I) => L({ ...U, apiKey: I.target.value }),
                sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
              }
            ),
            /* @__PURE__ */ t(
              _,
              {
                label: "App Name",
                value: U.appName,
                onChange: (I) => L({ ...U, appName: I.target.value }),
                required: !0,
                sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
              }
            ),
            /* @__PURE__ */ t(
              _,
              {
                label: "API Domain",
                value: U.apiDomain,
                onChange: (I) => L({ ...U, apiDomain: I.target.value }),
                required: !0,
                placeholder: "http://localhost:3000",
                sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
              }
            ),
            /* @__PURE__ */ t(
              _,
              {
                label: "Website Domain",
                value: U.websiteDomain,
                onChange: (I) => L({ ...U, websiteDomain: I.target.value }),
                required: !0,
                placeholder: "http://localhost:3000",
                sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
              }
            ),
            /* @__PURE__ */ t(
              _,
              {
                label: "API Base Path",
                value: U.apiBasePath || "/auth",
                onChange: (I) => L({ ...U, apiBasePath: I.target.value }),
                sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
              }
            )
          ] }),
          /* @__PURE__ */ t(f, { sx: { mt: 2 }, children: /* @__PURE__ */ t(
            Tt,
            {
              control: /* @__PURE__ */ t(
                Pt,
                {
                  checked: U.enableEmailPassword ?? !0,
                  onChange: (I) => L({ ...U, enableEmailPassword: I.target.checked }),
                  sx: { "& .MuiSwitch-switchBase.Mui-checked": { color: "var(--theme-primary)" } }
                }
              ),
              label: "Enable Email/Password Auth",
              sx: { color: "var(--theme-text-primary)" }
            }
          ) })
        ] }) }),
        /* @__PURE__ */ s(j, { sx: { bgcolor: "var(--theme-surface)", mb: 3 }, children: [
          /* @__PURE__ */ t(R, { sx: { pb: ve ? 2 : 0 }, children: /* @__PURE__ */ s(
            f,
            {
              sx: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer"
              },
              onClick: () => bt(!ve),
              children: [
                /* @__PURE__ */ t(k, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: "Social Login Providers" }),
                ve ? /* @__PURE__ */ t(al, {}) : /* @__PURE__ */ t(ol, {})
              ]
            }
          ) }),
          /* @__PURE__ */ t($o, { in: ve, children: /* @__PURE__ */ s(R, { sx: { pt: 0 }, children: [
            /* @__PURE__ */ t(Dn, { sx: { mb: 2 } }),
            /* @__PURE__ */ s(f, { sx: { mb: 3 }, children: [
              /* @__PURE__ */ t(
                Tt,
                {
                  control: /* @__PURE__ */ t(
                    Pt,
                    {
                      checked: x.enabled,
                      onChange: (I) => M({ ...x, enabled: I.target.checked }),
                      sx: { "& .MuiSwitch-switchBase.Mui-checked": { color: "var(--theme-primary)" } }
                    }
                  ),
                  label: "Google",
                  sx: { color: "var(--theme-text-primary)", mb: 1 }
                }
              ),
              x.enabled && /* @__PURE__ */ s(f, { sx: { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, ml: 4 }, children: [
                /* @__PURE__ */ t(
                  _,
                  {
                    label: "Client ID",
                    size: "small",
                    value: x.clientId,
                    onChange: (I) => M({ ...x, clientId: I.target.value }),
                    sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
                  }
                ),
                /* @__PURE__ */ t(
                  _,
                  {
                    label: "Client Secret",
                    size: "small",
                    type: "password",
                    value: x.clientSecret,
                    onChange: (I) => M({ ...x, clientSecret: I.target.value }),
                    sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ s(f, { sx: { mb: 3 }, children: [
              /* @__PURE__ */ t(
                Tt,
                {
                  control: /* @__PURE__ */ t(
                    Pt,
                    {
                      checked: W.enabled,
                      onChange: (I) => oe({ ...W, enabled: I.target.checked }),
                      sx: { "& .MuiSwitch-switchBase.Mui-checked": { color: "var(--theme-primary)" } }
                    }
                  ),
                  label: "GitHub",
                  sx: { color: "var(--theme-text-primary)", mb: 1 }
                }
              ),
              W.enabled && /* @__PURE__ */ s(f, { sx: { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, ml: 4 }, children: [
                /* @__PURE__ */ t(
                  _,
                  {
                    label: "Client ID",
                    size: "small",
                    value: W.clientId,
                    onChange: (I) => oe({ ...W, clientId: I.target.value }),
                    sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
                  }
                ),
                /* @__PURE__ */ t(
                  _,
                  {
                    label: "Client Secret",
                    size: "small",
                    type: "password",
                    value: W.clientSecret,
                    onChange: (I) => oe({ ...W, clientSecret: I.target.value }),
                    sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ s(f, { children: [
              /* @__PURE__ */ t(
                Tt,
                {
                  control: /* @__PURE__ */ t(
                    Pt,
                    {
                      checked: H.enabled,
                      onChange: (I) => pe({ ...H, enabled: I.target.checked }),
                      sx: { "& .MuiSwitch-switchBase.Mui-checked": { color: "var(--theme-primary)" } }
                    }
                  ),
                  label: "Apple",
                  sx: { color: "var(--theme-text-primary)", mb: 1 }
                }
              ),
              H.enabled && /* @__PURE__ */ s(f, { sx: { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, ml: 4 }, children: [
                /* @__PURE__ */ t(
                  _,
                  {
                    label: "Client ID",
                    size: "small",
                    value: H.clientId,
                    onChange: (I) => pe({ ...H, clientId: I.target.value }),
                    sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
                  }
                ),
                /* @__PURE__ */ t(
                  _,
                  {
                    label: "Client Secret",
                    size: "small",
                    type: "password",
                    value: H.clientSecret,
                    onChange: (I) => pe({ ...H, clientSecret: I.target.value }),
                    sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
                  }
                ),
                /* @__PURE__ */ t(
                  _,
                  {
                    label: "Key ID",
                    size: "small",
                    value: H.keyId || "",
                    onChange: (I) => pe({ ...H, keyId: I.target.value }),
                    sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
                  }
                ),
                /* @__PURE__ */ t(
                  _,
                  {
                    label: "Team ID",
                    size: "small",
                    value: H.teamId || "",
                    onChange: (I) => pe({ ...H, teamId: I.target.value }),
                    sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
                  }
                )
              ] })
            ] })
          ] }) })
        ] })
      ] }),
      g && /* @__PURE__ */ s(J, { severity: g.success ? "success" : "error", sx: { mb: 3 }, children: [
        /* @__PURE__ */ t(k, { variant: "body2", sx: { fontWeight: 600 }, children: g.success ? "Connection Successful" : "Connection Failed" }),
        /* @__PURE__ */ t(k, { variant: "body2", children: g.message }),
        ((xt = g.details) == null ? void 0 : xt.latency) && /* @__PURE__ */ s(k, { variant: "caption", sx: { display: "block", mt: 0.5 }, children: [
          "Latency: ",
          g.details.latency,
          "ms"
        ] })
      ] }),
      /* @__PURE__ */ s(f, { sx: { display: "flex", gap: 2, justifyContent: "space-between" }, children: [
        /* @__PURE__ */ s(f, { sx: { display: "flex", gap: 2 }, children: [
          /* @__PURE__ */ t(
            ue,
            {
              variant: "outlined",
              startIcon: /* @__PURE__ */ t(nl, {}),
              onClick: me,
              disabled: m,
              sx: {
                color: "var(--theme-text-secondary)",
                borderColor: "var(--theme-border)"
              },
              children: "Cancel"
            }
          ),
          (e == null ? void 0 : e.runtimeConfig) && /* @__PURE__ */ t(
            ue,
            {
              variant: "outlined",
              color: "error",
              startIcon: /* @__PURE__ */ t(_t, {}),
              onClick: () => he(!0),
              disabled: m,
              children: "Reset to Env Vars"
            }
          )
        ] }),
        /* @__PURE__ */ s(f, { sx: { display: "flex", gap: 2 }, children: [
          /* @__PURE__ */ t(
            ue,
            {
              variant: "outlined",
              startIcon: v ? /* @__PURE__ */ t(re, { size: 16 }) : /* @__PURE__ */ t(Wt, {}),
              onClick: Vt,
              disabled: !$ || v || m,
              sx: {
                color: "var(--theme-text-primary)",
                borderColor: "var(--theme-border)"
              },
              children: "Test Connection"
            }
          ),
          /* @__PURE__ */ t(
            ue,
            {
              variant: "contained",
              startIcon: m ? /* @__PURE__ */ t(re, { size: 16, sx: { color: "white" } }) : /* @__PURE__ */ t(rl, {}),
              onClick: vt,
              disabled: m,
              sx: {
                bgcolor: "var(--theme-primary)",
                "&:hover": { bgcolor: "var(--theme-primary-dark)" }
              },
              children: "Save Configuration"
            }
          )
        ] })
      ] })
    ] }) : /* @__PURE__ */ s(Fe, { children: [
      /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)", mb: 3 }, children: /* @__PURE__ */ s(R, { children: [
        /* @__PURE__ */ s(f, { sx: { display: "flex", alignItems: "center", gap: 2, mb: 2 }, children: [
          il((e == null ? void 0 : e.state) || "disabled"),
          /* @__PURE__ */ s(f, { sx: { flex: 1 }, children: [
            /* @__PURE__ */ s(k, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: [
              "Status:",
              " ",
              /* @__PURE__ */ t(
                ne,
                {
                  label: ((Ge = e == null ? void 0 : e.state) == null ? void 0 : Ge.toUpperCase()) || "UNKNOWN",
                  size: "small",
                  sx: {
                    bgcolor: `${Sn((e == null ? void 0 : e.state) || "disabled")}20`,
                    color: Sn((e == null ? void 0 : e.state) || "disabled"),
                    fontWeight: 600
                  }
                }
              )
            ] }),
            (e == null ? void 0 : e.adapter) && /* @__PURE__ */ s(k, { variant: "body2", sx: { color: "var(--theme-text-secondary)", mt: 0.5 }, children: [
              "Adapter: ",
              /* @__PURE__ */ t("strong", { children: e.adapter })
            ] })
          ] }),
          (e == null ? void 0 : e.state) === "enabled" && (e == null ? void 0 : e.adapter) && /* @__PURE__ */ t(
            ue,
            {
              variant: "outlined",
              size: "small",
              startIcon: v ? /* @__PURE__ */ t(re, { size: 14 }) : /* @__PURE__ */ t(Wt, {}),
              onClick: gr,
              disabled: v,
              sx: {
                color: "var(--theme-text-primary)",
                borderColor: "var(--theme-border)"
              },
              children: "Test Connection"
            }
          )
        ] }),
        g && !h && /* @__PURE__ */ s(J, { severity: g.success ? "success" : "error", sx: { mb: 2 }, children: [
          /* @__PURE__ */ t(k, { variant: "body2", sx: { fontWeight: 600 }, children: g.success ? "Connection Successful" : "Connection Failed" }),
          /* @__PURE__ */ t(k, { variant: "body2", children: g.message }),
          ((Ct = g.details) == null ? void 0 : Ct.latency) && /* @__PURE__ */ s(k, { variant: "caption", sx: { display: "block", mt: 0.5 }, children: [
            "Latency: ",
            g.details.latency,
            "ms"
          ] })
        ] }),
        (e == null ? void 0 : e.state) === "enabled" && !(e != null && e.runtimeConfig) && /* @__PURE__ */ s(J, { severity: "success", sx: { mb: 2 }, children: [
          /* @__PURE__ */ t(k, { variant: "body2", sx: { fontWeight: 600 }, children: "Configured via Environment Variables" }),
          /* @__PURE__ */ t(k, { variant: "body2", children: 'Authentication is configured using environment variables. Click "Edit" to override with runtime configuration (requires PostgreSQL).' })
        ] }),
        (e == null ? void 0 : e.runtimeConfig) && /* @__PURE__ */ t(
          ne,
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
        (e == null ? void 0 : e.state) === "error" && e.error && /* @__PURE__ */ t(J, { severity: "error", sx: { mb: 2 }, children: e.error }),
        (e == null ? void 0 : e.missingVars) && e.missingVars.length > 0 && /* @__PURE__ */ s(J, { severity: "warning", sx: { mb: 2 }, children: [
          /* @__PURE__ */ t(k, { variant: "body2", sx: { fontWeight: 600, mb: 1 }, children: "Missing environment variables:" }),
          /* @__PURE__ */ t(f, { component: "ul", sx: { m: 0, pl: 2 }, children: e.missingVars.map((I) => /* @__PURE__ */ t("li", { children: /* @__PURE__ */ t("code", { children: I }) }, I)) })
        ] }),
        (e == null ? void 0 : e.state) === "disabled" && /* @__PURE__ */ s(J, { severity: "info", children: [
          /* @__PURE__ */ s(k, { variant: "body2", children: [
            "Authentication is disabled. Click the edit button to configure a provider, or set the",
            " ",
            /* @__PURE__ */ t("code", { children: "AUTH_ADAPTER" }),
            " environment variable."
          ] }),
          /* @__PURE__ */ s(k, { variant: "body2", sx: { mt: 1 }, children: [
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
      ot.length > 0 && /* @__PURE__ */ s(j, { sx: { bgcolor: "var(--theme-surface)" }, children: [
        /* @__PURE__ */ t(R, { sx: { pb: 0 }, children: /* @__PURE__ */ t(k, { variant: "h6", sx: { color: "var(--theme-text-primary)", mb: 2 }, children: "Current Configuration" }) }),
        /* @__PURE__ */ t(Qe, { children: /* @__PURE__ */ s(Ye, { size: "small", children: [
          /* @__PURE__ */ t(Xe, { children: /* @__PURE__ */ s(fe, { children: [
            /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Variable" }),
            /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Value" }),
            /* @__PURE__ */ t(
              D,
              {
                sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", width: 60 },
                children: "Actions"
              }
            )
          ] }) }),
          /* @__PURE__ */ t(Ze, { children: ot.map(([I, q]) => /* @__PURE__ */ s(fe, { children: [
            /* @__PURE__ */ t(D, { sx: { borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(
              k,
              {
                sx: { color: "var(--theme-text-primary)", fontFamily: "monospace", fontSize: 13 },
                children: I
              }
            ) }),
            /* @__PURE__ */ t(D, { sx: { borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(
              k,
              {
                sx: {
                  color: q.includes("*") ? "var(--theme-text-secondary)" : "var(--theme-text-primary)",
                  fontFamily: "monospace",
                  fontSize: 13
                },
                children: q
              }
            ) }),
            /* @__PURE__ */ t(D, { sx: { borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(Ee, { title: c === I ? "Copied!" : "Copy value", children: /* @__PURE__ */ t(
              Ae,
              {
                size: "small",
                onClick: () => Oe(I, q),
                sx: { color: c === I ? "var(--theme-success)" : "var(--theme-text-secondary)" },
                children: /* @__PURE__ */ t(Hr, { fontSize: "small" })
              }
            ) }) })
          ] }, I)) })
        ] }) })
      ] }),
      (e == null ? void 0 : e.state) === "enabled" && ot.length === 0 && /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(R, { children: /* @__PURE__ */ t(k, { sx: { color: "var(--theme-text-secondary)", textAlign: "center" }, children: "No configuration details available" }) }) })
    ] }),
    /* @__PURE__ */ s(Br, { open: ge, onClose: () => he(!1), children: [
      /* @__PURE__ */ t(Or, { children: "Reset to Environment Variables?" }),
      /* @__PURE__ */ t(Mr, { children: /* @__PURE__ */ t(k, { children: "This will delete the runtime configuration from the database. The auth plugin will fall back to environment variables on the next request." }) }),
      /* @__PURE__ */ s(Lr, { children: [
        /* @__PURE__ */ t(ue, { onClick: () => he(!1), children: "Cancel" }),
        /* @__PURE__ */ t(ue, { onClick: nt, color: "error", disabled: m, children: m ? /* @__PURE__ */ t(re, { size: 20 }) : "Reset" })
      ] })
    ] })
  ] });
}
const ll = Y(/* @__PURE__ */ t("path", {
  d: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
}), "Home");
function cl() {
  const e = Nn();
  return /* @__PURE__ */ s(
    f,
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
        /* @__PURE__ */ t(k, { variant: "h1", sx: { color: "var(--theme-primary)", mb: 2 }, children: "404" }),
        /* @__PURE__ */ t(k, { variant: "h5", sx: { color: "var(--theme-text-primary)", mb: 1 }, children: "Page Not Found" }),
        /* @__PURE__ */ t(k, { sx: { color: "var(--theme-text-secondary)", mb: 4 }, children: "The page you're looking for doesn't exist or has been moved." }),
        /* @__PURE__ */ t(
          ue,
          {
            variant: "contained",
            startIcon: /* @__PURE__ */ t(ll, {}),
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
function dl({ version: e }) {
  return /* @__PURE__ */ t(f, { sx: { display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, py: 2 }, children: /* @__PURE__ */ s(F, { variant: "caption", customColor: "var(--theme-text-secondary)", children: [
    "Built with",
    " ",
    /* @__PURE__ */ t(
      Ao,
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
function hl() {
  return [
    { id: "dashboard", label: "Dashboard", route: "/", icon: "dashboard" },
    { id: "logs", label: "Logs", route: "/logs", icon: "article" },
    { id: "auth", label: "Auth", route: "/auth", icon: "lock" },
    { id: "system", label: "System", route: "/system", icon: "settings" }
  ];
}
function Sl({
  productName: e = "Control Panel",
  logo: r,
  footerContent: n,
  dashboardWidgets: o = [],
  widgetComponents: a = [],
  navigationItems: i = [],
  showBaseNavigation: c = !0,
  hideBaseNavItems: l = [],
  showThemeSwitcher: h = !0,
  showPaletteSwitcher: u = !0,
  basePath: m = "",
  // Keep for backwards compatibility but unused (API always at /api)
  children: p
}) {
  const [v, S] = y(""), g = [...Rs(), ...a], A = "";
  K.setBaseUrl(A), te(() => {
    K.getInfo().then((b) => S(b.version || "")).catch(() => {
    });
  }, [A]);
  const B = [
    ...c ? hl().filter((b) => !l.includes(b.id)) : [],
    ...i
  ];
  return /* @__PURE__ */ t(fs, { initialComponents: g, children: /* @__PURE__ */ t(us, { initialWidgets: o, children: /* @__PURE__ */ t(
    Bo,
    {
      config: jo,
      logo: r || /* @__PURE__ */ t(Oo, { name: e }),
      footerContent: n || /* @__PURE__ */ t(dl, { version: v }),
      enableScaffolding: !0,
      navigationItems: B,
      showThemeSwitcher: h,
      showPaletteSwitcher: u,
      children: /* @__PURE__ */ s(wo, { children: [
        c && /* @__PURE__ */ s(Fe, { children: [
          !l.includes("dashboard") && /* @__PURE__ */ t(At, { path: "/", element: /* @__PURE__ */ t(Ws, {}) }),
          !l.includes("logs") && /* @__PURE__ */ t(At, { path: "/logs", element: /* @__PURE__ */ t(Ks, {}) }),
          !l.includes("auth") && /* @__PURE__ */ t(At, { path: "/auth", element: /* @__PURE__ */ t(sl, {}) }),
          !l.includes("system") && /* @__PURE__ */ t(At, { path: "/system", element: /* @__PURE__ */ t(tl, {}) })
        ] }),
        p,
        /* @__PURE__ */ t(At, { path: "*", element: /* @__PURE__ */ t(cl, {}) })
      ] })
    }
  ) }) });
}
const Lt = Y(/* @__PURE__ */ t("path", {
  d: "m21.41 11.58-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.06-.59-1.42M5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7"
}), "LocalOffer");
function kl({
  title: e = "User Management",
  subtitle: r = "Manage users, bans, and entitlements",
  features: n,
  headerActions: o,
  onUserSelect: a
}) {
  const [i, c] = y({
    users: (n == null ? void 0 : n.users) ?? !0,
    bans: (n == null ? void 0 : n.bans) ?? !1,
    entitlements: (n == null ? void 0 : n.entitlements) ?? !1,
    entitlementsReadonly: (n == null ? void 0 : n.entitlementsReadonly) ?? !0
  }), [l, h] = y(!!n), [u, m] = y(0), [p, v] = y([]), [S, g] = y(0), [A, $] = y(0), [B, O] = y(25), [E, b] = y(""), [N, T] = y({}), [V, U] = y([]), [L, de] = y(0), [G, d] = y([]), [P, x] = y(0), [M, W] = y(!0), [oe, H] = y(null), [pe, ve] = y(null), [bt, ge] = y(!1), [he, z] = y({
    email: "",
    reason: "",
    expiresAt: ""
  }), [Oe, Ke] = y(!1), [me, De] = y({
    email: "",
    name: "",
    role: "",
    expiresInDays: 7
  }), [je, Vt] = y(null), [gr, vt] = y(!1), [nt, ot] = y(""), [xt, Ge] = y(!1), [Ct, I] = y(!1), [q, ze] = y(null), [wt, ye] = y(null), [Ce, xe] = y([]), [St, Kr] = y(""), [so, Gr] = y(!1);
  te(() => {
    n || K.detectFeatures().then((w) => {
      c(w), h(!0);
    }).catch(() => {
      h(!0);
    });
  }, [n]), te(() => {
    l && i.entitlements && !i.entitlementsReadonly && K.getAvailableEntitlements().then(xe).catch(() => {
    });
  }, [l, i.entitlements, i.entitlementsReadonly]);
  const kt = be(async () => {
    var w;
    if (i.users) {
      W(!0);
      try {
        const Q = await K.getUsers({
          limit: B,
          page: A,
          search: E || void 0
        });
        if (v(Q.users || []), g(Q.total), H(null), i.entitlements && ((w = Q.users) != null && w.length)) {
          const It = {};
          await Promise.all(
            Q.users.map(async ($t) => {
              try {
                const go = await K.getEntitlements($t.email);
                It[$t.email] = go.entitlements.length;
              } catch {
                It[$t.email] = 0;
              }
            })
          ), T(($t) => ({ ...$t, ...It }));
        }
      } catch (Q) {
        H(Q instanceof Error ? Q.message : "Failed to fetch users");
      } finally {
        W(!1);
      }
    }
  }, [i.users, i.entitlements, A, B, E]), at = be(async () => {
    if (i.bans) {
      W(!0);
      try {
        const w = await K.getBans();
        U(w.bans || []), de(w.total), H(null);
      } catch (w) {
        H(w instanceof Error ? w.message : "Failed to fetch bans");
      } finally {
        W(!1);
      }
    }
  }, [i.bans]), qr = be(async () => {
    if (i.users) {
      W(!0);
      try {
        const w = await K.getInvitations();
        d(w.users || []), x(w.total), H(null);
      } catch (w) {
        H(w instanceof Error ? w.message : "Failed to fetch invitations");
      } finally {
        W(!1);
      }
    }
  }, [i.users]);
  te(() => {
    l && (u === 0 && i.users ? kt() : u === 1 && i.bans ? at() : u === 2 && i.users && qr());
  }, [u, l, i.users, i.bans, kt, at, qr]), te(() => {
    l && i.bans && at();
  }, [l, i.bans, at]), te(() => {
    if (!l) return;
    const w = setTimeout(() => {
      u === 0 && i.users && ($(0), kt());
    }, 300);
    return () => clearTimeout(w);
  }, [E, u, l, i.users, kt]);
  const lo = async () => {
    try {
      await K.banUser(he.email, he.reason, he.expiresAt || void 0), ve("User banned successfully"), ge(!1), z({ email: "", reason: "", expiresAt: "" }), at();
    } catch (w) {
      H(w instanceof Error ? w.message : "Failed to ban user");
    }
  }, co = async (w) => {
    if (confirm("Unban this user?"))
      try {
        await K.unbanUser(w), ve("User unbanned successfully"), at();
      } catch {
        H("Failed to unban user");
      }
  }, ho = async () => {
    try {
      const w = await K.inviteUser({
        email: me.email,
        name: me.name || void 0,
        role: me.role || void 0,
        expiresInDays: me.expiresInDays
      });
      Vt({ token: w.token, inviteLink: w.inviteLink }), ve("User invitation created successfully"), kt();
    } catch (w) {
      H(w instanceof Error ? w.message : "Failed to invite user");
    }
  }, uo = () => {
    je && (navigator.clipboard.writeText(je.inviteLink), ve("Invite link copied to clipboard"));
  }, Jr = () => {
    Ke(!1), De({ email: "", name: "", role: "", expiresInDays: 7 }), Vt(null);
  }, Qr = async () => {
    if (!nt.trim()) {
      ye("Please enter an email address");
      return;
    }
    Ge(!0), ye(null), ze(null);
    try {
      const w = await K.getEntitlements(nt);
      ze(w);
    } catch (w) {
      ye(w instanceof Error ? w.message : "Failed to lookup entitlements");
    } finally {
      Ge(!1);
    }
  }, mo = async () => {
    if (q) {
      I(!0);
      try {
        const w = await K.refreshEntitlements(nt);
        ze(w);
      } catch {
        ye("Failed to refresh entitlements");
      } finally {
        I(!1);
      }
    }
  }, fo = async () => {
    if (!(!St || !q)) {
      Gr(!0);
      try {
        await K.grantEntitlement(q.identifier, St), ve(`Entitlement "${St}" granted`), Kr("");
        const w = await K.refreshEntitlements(q.identifier);
        ze(w), T((Q) => ({
          ...Q,
          [q.identifier]: w.entitlements.length
        }));
      } catch (w) {
        H(w instanceof Error ? w.message : "Failed to grant entitlement");
      } finally {
        Gr(!1);
      }
    }
  }, po = async (w) => {
    if (q && confirm(`Revoke "${w}" from ${q.identifier}?`))
      try {
        await K.revokeEntitlement(q.identifier, w), ve(`Entitlement "${w}" revoked`);
        const Q = await K.refreshEntitlements(q.identifier);
        ze(Q), T((It) => ({
          ...It,
          [q.identifier]: Q.entitlements.length
        }));
      } catch (Q) {
        H(Q instanceof Error ? Q.message : "Failed to revoke entitlement");
      }
  }, Yr = (w) => {
    w && (ot(w), Ge(!0), ye(null), ze(null), K.getEntitlements(w).then(ze).catch((Q) => ye(Q instanceof Error ? Q.message : "Failed to lookup entitlements")).finally(() => Ge(!1))), vt(!0);
  }, it = (w) => w ? new Date(w).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }) : "Never", yr = Ce.filter(
    (w) => !(q != null && q.entitlements.includes(w.name))
  ), Et = [];
  return i.users && Et.push({ label: "Users", count: S }), i.bans && Et.push({ label: "Banned", count: L }), i.users && Et.push({ label: "Invitations", count: P }), l ? /* @__PURE__ */ s(f, { children: [
    /* @__PURE__ */ s(f, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }, children: [
      /* @__PURE__ */ s(f, { children: [
        /* @__PURE__ */ t(F, { variant: "h4", content: e, customColor: "var(--theme-text-primary)" }),
        /* @__PURE__ */ t(F, { variant: "body2", content: r, customColor: "var(--theme-text-secondary)" })
      ] }),
      /* @__PURE__ */ s(f, { sx: { display: "flex", gap: 1 }, children: [
        o,
        i.users && /* @__PURE__ */ t(
          ie,
          {
            variant: "primary",
            icon: "person_add",
            label: "Invite User",
            onClick: () => Ke(!0)
          }
        ),
        i.entitlements && /* @__PURE__ */ t(
          ie,
          {
            variant: "outlined",
            icon: "person_search",
            label: "Lookup Entitlements",
            onClick: () => Yr()
          }
        ),
        i.bans && /* @__PURE__ */ t(
          ie,
          {
            variant: "outlined",
            color: "error",
            icon: "block",
            label: "Ban User",
            onClick: () => ge(!0)
          }
        )
      ] })
    ] }),
    M && /* @__PURE__ */ t(tr, { sx: { mb: 2 } }),
    oe && /* @__PURE__ */ t(J, { severity: "error", onClose: () => H(null), sx: { mb: 2 }, children: oe }),
    pe && /* @__PURE__ */ t(J, { severity: "success", onClose: () => ve(null), sx: { mb: 2 }, children: pe }),
    i.users && /* @__PURE__ */ s(rr, { columns: i.bans ? 3 : 2, spacing: "medium", sx: { mb: 3 }, equalHeight: !0, children: [
      /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(R, { children: /* @__PURE__ */ s(f, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        /* @__PURE__ */ t(io, { sx: { fontSize: 40, color: "var(--theme-primary)" } }),
        /* @__PURE__ */ s(f, { children: [
          /* @__PURE__ */ t(F, { variant: "h4", content: S.toLocaleString(), customColor: "var(--theme-text-primary)" }),
          /* @__PURE__ */ t(F, { variant: "body2", content: "Total Users", customColor: "var(--theme-text-secondary)" })
        ] })
      ] }) }) }),
      i.entitlements && /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(R, { children: /* @__PURE__ */ s(f, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        /* @__PURE__ */ t(Lt, { sx: { fontSize: 40, color: "var(--theme-success)" } }),
        /* @__PURE__ */ s(f, { children: [
          /* @__PURE__ */ t(F, { variant: "body1", fontWeight: "500", content: "Entitlements", customColor: "var(--theme-text-primary)" }),
          /* @__PURE__ */ t(
            F,
            {
              variant: "body2",
              content: i.entitlementsReadonly ? "Read-only Mode" : "Plugin Active",
              customColor: i.entitlementsReadonly ? "var(--theme-warning)" : "var(--theme-success)"
            }
          )
        ] })
      ] }) }) }),
      i.bans && /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(R, { children: /* @__PURE__ */ s(f, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        /* @__PURE__ */ t(_r, { sx: { fontSize: 40, color: L > 0 ? "var(--theme-error)" : "var(--theme-text-secondary)" } }),
        /* @__PURE__ */ s(f, { children: [
          /* @__PURE__ */ t(F, { variant: "h4", content: L.toString(), customColor: L > 0 ? "var(--theme-error)" : "var(--theme-text-primary)" }),
          /* @__PURE__ */ t(F, { variant: "body2", content: "Banned Users", customColor: "var(--theme-text-secondary)" })
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ s(j, { sx: { bgcolor: "var(--theme-surface)" }, children: [
      Et.length > 1 && /* @__PURE__ */ t(
        To,
        {
          value: u,
          onChange: (w, Q) => m(Q),
          sx: { borderBottom: 1, borderColor: "var(--theme-border)", px: 2 },
          children: Et.map((w, Q) => /* @__PURE__ */ t(Po, { label: `${w.label}${w.count !== void 0 ? ` (${w.count})` : ""}` }, Q))
        }
      ),
      /* @__PURE__ */ s(R, { sx: { p: 0 }, children: [
        /* @__PURE__ */ t(f, { sx: { p: 2, borderBottom: 1, borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(
          _,
          {
            size: "small",
            placeholder: "Search by email or name...",
            value: E,
            onChange: (w) => b(w.target.value),
            InputProps: {
              startAdornment: /* @__PURE__ */ t(Gt, { position: "start", children: /* @__PURE__ */ t(Vr, { sx: { color: "var(--theme-text-secondary)" } }) })
            },
            sx: { minWidth: 300 }
          }
        ) }),
        u === 0 && i.users && /* @__PURE__ */ s(Fe, { children: [
          /* @__PURE__ */ t(Qe, { children: /* @__PURE__ */ s(Ye, { children: [
            /* @__PURE__ */ t(Xe, { children: /* @__PURE__ */ s(fe, { children: [
              /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "ID" }),
              /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Name" }),
              /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Email" }),
              i.entitlements && /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, align: "center", children: "Entitlements" }),
              /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Created" }),
              /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, align: "right", children: "Actions" })
            ] }) }),
            /* @__PURE__ */ s(Ze, { children: [
              p.map((w) => /* @__PURE__ */ s(
                fe,
                {
                  hover: !0,
                  sx: { cursor: a ? "pointer" : "default" },
                  onClick: () => a == null ? void 0 : a(w),
                  children: [
                    /* @__PURE__ */ s(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", fontFamily: "monospace", fontSize: "0.75rem" }, children: [
                      w.id.substring(0, 8),
                      "..."
                    ] }),
                    /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(F, { variant: "body1", content: w.name || "--", fontWeight: "500" }) }),
                    /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)" }, children: w.email }),
                    i.entitlements && /* @__PURE__ */ t(D, { sx: { borderColor: "var(--theme-border)" }, align: "center", children: /* @__PURE__ */ t(
                      ne,
                      {
                        size: "small",
                        icon: /* @__PURE__ */ t(Lt, { sx: { fontSize: 14 } }),
                        label: N[w.email] ?? "...",
                        sx: {
                          bgcolor: "var(--theme-primary)20",
                          color: "var(--theme-primary)"
                        }
                      }
                    ) }),
                    /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: it(w.created_at) }),
                    /* @__PURE__ */ t(D, { sx: { borderColor: "var(--theme-border)" }, align: "right", children: i.entitlements && /* @__PURE__ */ t(Ee, { title: "View entitlements", children: /* @__PURE__ */ t(Ae, { size: "small", onClick: (Q) => {
                      Q.stopPropagation(), Yr(w.email);
                    }, children: /* @__PURE__ */ t(Lt, { fontSize: "small" }) }) }) })
                  ]
                },
                w.id
              )),
              p.length === 0 && !M && /* @__PURE__ */ t(fe, { children: /* @__PURE__ */ t(D, { colSpan: i.entitlements ? 6 : 5, align: "center", sx: { py: 4, color: "var(--theme-text-secondary)" }, children: E ? "No users match your search" : "No users found" }) })
            ] })
          ] }) }),
          /* @__PURE__ */ t(
            No,
            {
              component: "div",
              count: S,
              page: A,
              onPageChange: (w, Q) => $(Q),
              rowsPerPage: B,
              onRowsPerPageChange: (w) => {
                O(parseInt(w.target.value, 10)), $(0);
              },
              rowsPerPageOptions: [10, 25, 50, 100],
              sx: { borderTop: 1, borderColor: "var(--theme-border)" }
            }
          )
        ] }),
        u === 1 && i.bans && /* @__PURE__ */ t(Qe, { children: /* @__PURE__ */ s(Ye, { children: [
          /* @__PURE__ */ t(Xe, { children: /* @__PURE__ */ s(fe, { children: [
            /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Email" }),
            /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Reason" }),
            /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Banned At" }),
            /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Expires" }),
            /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Banned By" }),
            /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, align: "right", children: "Actions" })
          ] }) }),
          /* @__PURE__ */ s(Ze, { children: [
            V.map((w) => /* @__PURE__ */ s(fe, { children: [
              /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(F, { variant: "body1", content: w.email, fontWeight: "500" }) }),
              /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", maxWidth: 200 }, children: /* @__PURE__ */ t(F, { variant: "body2", content: w.reason, noWrap: !0 }) }),
              /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: it(w.banned_at) }),
              /* @__PURE__ */ t(D, { sx: { borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(
                ne,
                {
                  size: "small",
                  label: w.expires_at ? it(w.expires_at) : "Permanent",
                  sx: {
                    bgcolor: w.expires_at ? "var(--theme-warning)20" : "var(--theme-error)20",
                    color: w.expires_at ? "var(--theme-warning)" : "var(--theme-error)"
                  }
                }
              ) }),
              /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: w.banned_by }),
              /* @__PURE__ */ t(D, { sx: { borderColor: "var(--theme-border)" }, align: "right", children: /* @__PURE__ */ t(
                ie,
                {
                  buttonSize: "small",
                  variant: "text",
                  color: "success",
                  icon: "check_circle",
                  label: "Unban",
                  onClick: () => co(w.email)
                }
              ) })
            ] }, w.id)),
            V.length === 0 && !M && /* @__PURE__ */ t(fe, { children: /* @__PURE__ */ t(D, { colSpan: 6, align: "center", sx: { py: 4, color: "var(--theme-text-secondary)" }, children: "No users are currently banned" }) })
          ] })
        ] }) }),
        u === 2 && i.users && /* @__PURE__ */ t(Qe, { children: /* @__PURE__ */ s(Ye, { children: [
          /* @__PURE__ */ t(Xe, { children: /* @__PURE__ */ s(fe, { children: [
            /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Email" }),
            /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Name" }),
            /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Created" }),
            /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Expires" }),
            /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Status" })
          ] }) }),
          /* @__PURE__ */ s(Ze, { children: [
            G.map((w) => {
              const Q = w.invitation_expires_at && new Date(w.invitation_expires_at) < /* @__PURE__ */ new Date();
              return /* @__PURE__ */ s(fe, { children: [
                /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(F, { variant: "body1", content: w.email, fontWeight: "500" }) }),
                /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)" }, children: w.name || "--" }),
                /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: it(w.created_at) }),
                /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: it(w.invitation_expires_at) }),
                /* @__PURE__ */ t(D, { sx: { borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(
                  ne,
                  {
                    size: "small",
                    label: Q ? "Expired" : "Pending",
                    sx: {
                      bgcolor: Q ? "var(--theme-error)20" : "var(--theme-warning)20",
                      color: Q ? "var(--theme-error)" : "var(--theme-warning)"
                    }
                  }
                ) })
              ] }, w.id);
            }),
            G.length === 0 && !M && /* @__PURE__ */ t(fe, { children: /* @__PURE__ */ t(D, { colSpan: 5, align: "center", sx: { py: 4, color: "var(--theme-text-secondary)" }, children: "No pending invitations" }) })
          ] })
        ] }) })
      ] })
    ] }),
    i.users && /* @__PURE__ */ s(
      ut,
      {
        open: Oe,
        onClose: Jr,
        maxWidth: "sm",
        fullWidth: !0,
        children: [
          /* @__PURE__ */ t(mt, { children: "Invite User" }),
          /* @__PURE__ */ t(ft, { children: je ? /* @__PURE__ */ s(f, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [
            /* @__PURE__ */ t(J, { severity: "success", children: "Invitation created successfully! Share this link with the user:" }),
            /* @__PURE__ */ t(
              _,
              {
                label: "Invitation Link",
                fullWidth: !0,
                value: je.inviteLink,
                InputProps: {
                  readOnly: !0,
                  endAdornment: /* @__PURE__ */ t(Gt, { position: "end", children: /* @__PURE__ */ t(Ee, { title: "Copy to clipboard", children: /* @__PURE__ */ t(Ae, { onClick: uo, edge: "end", children: /* @__PURE__ */ t(Hr, {}) }) }) })
                },
                helperText: "Click the icon to copy the link to clipboard"
              }
            ),
            /* @__PURE__ */ t(J, { severity: "info", children: "The user will need to visit this link to activate their account." })
          ] }) : /* @__PURE__ */ s(f, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [
            /* @__PURE__ */ t(
              _,
              {
                label: "Email",
                fullWidth: !0,
                required: !0,
                value: me.email,
                onChange: (w) => De({ ...me, email: w.target.value }),
                placeholder: "user@example.com",
                type: "email"
              }
            ),
            /* @__PURE__ */ t(
              _,
              {
                label: "Name (Optional)",
                fullWidth: !0,
                value: me.name,
                onChange: (w) => De({ ...me, name: w.target.value }),
                placeholder: "Enter user's full name"
              }
            ),
            /* @__PURE__ */ t(
              _,
              {
                label: "Role (Optional)",
                fullWidth: !0,
                value: me.role,
                onChange: (w) => De({ ...me, role: w.target.value }),
                placeholder: "e.g., admin, editor, viewer",
                helperText: "Stored in user metadata for your app to use"
              }
            ),
            /* @__PURE__ */ t(
              _,
              {
                label: "Invitation Expiry",
                type: "number",
                fullWidth: !0,
                value: me.expiresInDays,
                onChange: (w) => De({ ...me, expiresInDays: parseInt(w.target.value) || 7 }),
                InputProps: {
                  endAdornment: /* @__PURE__ */ t(Gt, { position: "end", children: "days" })
                },
                helperText: "How many days until the invitation expires"
              }
            )
          ] }) }),
          /* @__PURE__ */ s(pt, { children: [
            /* @__PURE__ */ t(
              ie,
              {
                variant: "text",
                label: "Close",
                onClick: Jr
              }
            ),
            !je && /* @__PURE__ */ t(
              ie,
              {
                variant: "primary",
                label: "Create Invitation",
                onClick: ho,
                disabled: !me.email
              }
            )
          ] })
        ]
      }
    ),
    i.bans && /* @__PURE__ */ s(
      ut,
      {
        open: bt,
        onClose: () => ge(!1),
        maxWidth: "sm",
        fullWidth: !0,
        children: [
          /* @__PURE__ */ t(mt, { children: "Ban User" }),
          /* @__PURE__ */ t(ft, { children: /* @__PURE__ */ s(f, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [
            /* @__PURE__ */ t(
              _,
              {
                label: "Email",
                fullWidth: !0,
                value: he.email,
                onChange: (w) => z({ ...he, email: w.target.value }),
                placeholder: "Enter user email"
              }
            ),
            /* @__PURE__ */ t(
              _,
              {
                label: "Reason",
                fullWidth: !0,
                multiline: !0,
                rows: 3,
                value: he.reason,
                onChange: (w) => z({ ...he, reason: w.target.value }),
                placeholder: "Enter reason for ban"
              }
            ),
            /* @__PURE__ */ t(
              _,
              {
                label: "Expiration (Optional)",
                type: "datetime-local",
                fullWidth: !0,
                value: he.expiresAt,
                onChange: (w) => z({ ...he, expiresAt: w.target.value }),
                InputLabelProps: { shrink: !0 },
                helperText: "Leave empty for permanent ban"
              }
            )
          ] }) }),
          /* @__PURE__ */ s(pt, { children: [
            /* @__PURE__ */ t(
              ie,
              {
                variant: "text",
                label: "Cancel",
                onClick: () => {
                  ge(!1), z({ email: "", reason: "", expiresAt: "" });
                }
              }
            ),
            /* @__PURE__ */ t(
              ie,
              {
                variant: "primary",
                color: "error",
                label: "Ban User",
                onClick: lo,
                disabled: !he.email || !he.reason
              }
            )
          ] })
        ]
      }
    ),
    i.entitlements && /* @__PURE__ */ s(
      ut,
      {
        open: gr,
        onClose: () => vt(!1),
        maxWidth: "md",
        fullWidth: !0,
        children: [
          /* @__PURE__ */ t(mt, { children: "User Entitlements" }),
          /* @__PURE__ */ t(ft, { children: /* @__PURE__ */ s(f, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [
            /* @__PURE__ */ s(f, { sx: { display: "flex", gap: 1 }, children: [
              /* @__PURE__ */ t(
                _,
                {
                  label: "Email",
                  fullWidth: !0,
                  value: nt,
                  onChange: (w) => ot(w.target.value),
                  placeholder: "Enter user email",
                  onKeyDown: (w) => w.key === "Enter" && Qr()
                }
              ),
              /* @__PURE__ */ t(
                ie,
                {
                  variant: "primary",
                  icon: "search",
                  label: "Lookup",
                  onClick: Qr,
                  disabled: xt
                }
              )
            ] }),
            xt && /* @__PURE__ */ t(f, { sx: { display: "flex", justifyContent: "center", py: 4 }, children: /* @__PURE__ */ t(re, {}) }),
            wt && /* @__PURE__ */ t(J, { severity: "error", children: wt }),
            q && /* @__PURE__ */ s(f, { children: [
              /* @__PURE__ */ s(f, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }, children: [
                /* @__PURE__ */ s(f, { children: [
                  /* @__PURE__ */ t(F, { variant: "h6", content: q.identifier, customColor: "var(--theme-text-primary)" }),
                  /* @__PURE__ */ t(F, { variant: "body2", content: `Source: ${q.source}`, customColor: "var(--theme-text-secondary)" })
                ] }),
                /* @__PURE__ */ t(
                  ie,
                  {
                    variant: "outlined",
                    icon: "refresh",
                    label: Ct ? "Refreshing..." : "Refresh",
                    onClick: mo,
                    disabled: Ct,
                    buttonSize: "small"
                  }
                )
              ] }),
              !i.entitlementsReadonly && yr.length > 0 && /* @__PURE__ */ s(f, { sx: { display: "flex", gap: 1, mb: 2, p: 2, bgcolor: "var(--theme-background)", borderRadius: 1 }, children: [
                /* @__PURE__ */ t(
                  Do,
                  {
                    size: "small",
                    options: yr,
                    getOptionLabel: (w) => w.name,
                    value: yr.find((w) => w.name === St) || null,
                    onChange: (w, Q) => Kr((Q == null ? void 0 : Q.name) || ""),
                    renderInput: (w) => /* @__PURE__ */ t(_, { ...w, label: "Grant Entitlement", placeholder: "Select entitlement" }),
                    sx: { flex: 1 }
                  }
                ),
                /* @__PURE__ */ t(
                  ie,
                  {
                    variant: "primary",
                    icon: "add",
                    label: "Grant",
                    onClick: fo,
                    disabled: !St || so,
                    buttonSize: "small"
                  }
                )
              ] }),
              /* @__PURE__ */ t(F, { variant: "subtitle2", content: "Current Entitlements", customColor: "var(--theme-text-secondary)", style: { marginBottom: "8px" } }),
              q.entitlements.length === 0 ? /* @__PURE__ */ t(F, { variant: "body2", content: "No entitlements found", customColor: "var(--theme-text-secondary)" }) : /* @__PURE__ */ t(f, { sx: { display: "flex", flexWrap: "wrap", gap: 1 }, children: q.entitlements.map((w, Q) => /* @__PURE__ */ t(
                ne,
                {
                  icon: /* @__PURE__ */ t(Ne, { sx: { fontSize: 16 } }),
                  label: w,
                  onDelete: i.entitlementsReadonly ? void 0 : () => po(w),
                  deleteIcon: /* @__PURE__ */ t(_t, { sx: { fontSize: 16 } }),
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
                Q
              )) }),
              /* @__PURE__ */ s(f, { sx: { mt: 2, pt: 2, borderTop: 1, borderColor: "var(--theme-border)" }, children: [
                /* @__PURE__ */ t(F, { variant: "caption", content: `Data from: ${q.source === "cache" ? "Cache" : "Source"}`, customColor: "var(--theme-text-secondary)" }),
                q.cachedAt && /* @__PURE__ */ t(F, { variant: "caption", content: ` | Cached: ${it(q.cachedAt)}`, customColor: "var(--theme-text-secondary)" }),
                i.entitlementsReadonly && /* @__PURE__ */ t(F, { variant: "caption", content: " | Read-only mode (modifications disabled)", customColor: "var(--theme-warning)" })
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ t(pt, { children: /* @__PURE__ */ t(ie, { variant: "text", label: "Close", onClick: () => vt(!1) }) })
        ]
      }
    )
  ] }) : /* @__PURE__ */ t(f, { sx: { display: "flex", justifyContent: "center", py: 8 }, children: /* @__PURE__ */ t(re, {}) });
}
const An = Y(/* @__PURE__ */ t("path", {
  d: "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2m-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2m3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1z"
}), "Lock");
function El({
  title: e = "Entitlements",
  subtitle: r = "Manage available entitlements",
  headerActions: n
}) {
  var he;
  const [o, a] = y(null), [i, c] = y(!0), [l, h] = y([]), [u, m] = y([]), [p, v] = y(!0), [S, g] = y(null), [A, $] = y(null), [B, O] = y(""), [E, b] = y(!1), [N, T] = y(!1), [V, U] = y(!1), [L, de] = y(null), [G, d] = y({
    name: "",
    category: "",
    description: ""
  }), [P, x] = y(!1);
  te(() => {
    K.getEntitlementsStatus().then(a).catch((z) => g(z instanceof Error ? z.message : "Failed to get status")).finally(() => c(!1));
  }, []);
  const M = be(async () => {
    v(!0);
    try {
      const z = await K.getAvailableEntitlements();
      h(z), g(null);
    } catch (z) {
      g(z instanceof Error ? z.message : "Failed to fetch entitlements");
    } finally {
      v(!1);
    }
  }, []);
  te(() => {
    M();
  }, [M]), te(() => {
    if (!B.trim())
      m(l);
    else {
      const z = B.toLowerCase();
      m(
        l.filter(
          (Oe) => {
            var Ke, me;
            return Oe.name.toLowerCase().includes(z) || ((Ke = Oe.category) == null ? void 0 : Ke.toLowerCase().includes(z)) || ((me = Oe.description) == null ? void 0 : me.toLowerCase().includes(z));
          }
        )
      );
    }
  }, [l, B]);
  const W = [...new Set(l.map((z) => z.category || "Uncategorized"))], oe = async () => {
    if (!G.name.trim()) {
      g("Name is required");
      return;
    }
    x(!0);
    try {
      $(`Entitlement "${G.name}" created`), b(!1), d({ name: "", category: "", description: "" }), M();
    } catch (z) {
      g(z instanceof Error ? z.message : "Failed to create entitlement");
    } finally {
      x(!1);
    }
  }, H = async () => {
    if (L) {
      x(!0);
      try {
        $(`Entitlement "${L.name}" updated`), T(!1), de(null), M();
      } catch (z) {
        g(z instanceof Error ? z.message : "Failed to update entitlement");
      } finally {
        x(!1);
      }
    }
  }, pe = async () => {
    if (L) {
      x(!0);
      try {
        $(`Entitlement "${L.name}" deleted`), U(!1), de(null), M();
      } catch (z) {
        g(z instanceof Error ? z.message : "Failed to delete entitlement");
      } finally {
        x(!1);
      }
    }
  }, ve = (z) => {
    de(z), T(!0);
  }, bt = (z) => {
    de(z), U(!0);
  }, ge = (o == null ? void 0 : o.readonly) ?? !0;
  return i ? /* @__PURE__ */ t(f, { sx: { display: "flex", justifyContent: "center", py: 8 }, children: /* @__PURE__ */ t(re, {}) }) : /* @__PURE__ */ s(f, { children: [
    /* @__PURE__ */ s(f, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }, children: [
      /* @__PURE__ */ s(f, { children: [
        /* @__PURE__ */ t(F, { variant: "h4", content: e, customColor: "var(--theme-text-primary)" }),
        /* @__PURE__ */ t(F, { variant: "body2", content: r, customColor: "var(--theme-text-secondary)" })
      ] }),
      /* @__PURE__ */ s(f, { sx: { display: "flex", gap: 1 }, children: [
        n,
        !ge && /* @__PURE__ */ t(
          ie,
          {
            variant: "primary",
            icon: "add",
            label: "Add Entitlement",
            onClick: () => b(!0)
          }
        )
      ] })
    ] }),
    p && /* @__PURE__ */ t(tr, { sx: { mb: 2 } }),
    S && /* @__PURE__ */ t(J, { severity: "error", onClose: () => g(null), sx: { mb: 2 }, children: S }),
    A && /* @__PURE__ */ t(J, { severity: "success", onClose: () => $(null), sx: { mb: 2 }, children: A }),
    /* @__PURE__ */ s(rr, { columns: 3, spacing: "medium", sx: { mb: 3 }, equalHeight: !0, children: [
      /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(R, { children: /* @__PURE__ */ s(f, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        /* @__PURE__ */ t(Lt, { sx: { fontSize: 40, color: "var(--theme-primary)" } }),
        /* @__PURE__ */ s(f, { children: [
          /* @__PURE__ */ t(F, { variant: "h4", content: l.length.toString(), customColor: "var(--theme-text-primary)" }),
          /* @__PURE__ */ t(F, { variant: "body2", content: "Total Entitlements", customColor: "var(--theme-text-secondary)" })
        ] })
      ] }) }) }),
      /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(R, { children: /* @__PURE__ */ s(f, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        /* @__PURE__ */ t(
          f,
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
            children: /* @__PURE__ */ t(F, { variant: "h6", content: W.length.toString(), customColor: "var(--theme-primary)" })
          }
        ),
        /* @__PURE__ */ s(f, { children: [
          /* @__PURE__ */ t(F, { variant: "body1", fontWeight: "500", content: "Categories", customColor: "var(--theme-text-primary)" }),
          /* @__PURE__ */ t(F, { variant: "body2", content: W.slice(0, 3).join(", "), customColor: "var(--theme-text-secondary)" })
        ] })
      ] }) }) }),
      /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(R, { children: /* @__PURE__ */ s(f, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        ge ? /* @__PURE__ */ t(An, { sx: { fontSize: 40, color: "var(--theme-warning)" } }) : /* @__PURE__ */ t(zr, { sx: { fontSize: 40, color: "var(--theme-success)" } }),
        /* @__PURE__ */ s(f, { children: [
          /* @__PURE__ */ t(
            F,
            {
              variant: "body1",
              fontWeight: "500",
              content: ge ? "Read-only" : "Editable",
              customColor: ge ? "var(--theme-warning)" : "var(--theme-success)"
            }
          ),
          /* @__PURE__ */ t(F, { variant: "body2", content: `Source: ${((he = o == null ? void 0 : o.sources[0]) == null ? void 0 : he.name) || "Unknown"}`, customColor: "var(--theme-text-secondary)" })
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ s(R, { sx: { p: 0 }, children: [
      /* @__PURE__ */ t(f, { sx: { p: 2, borderBottom: 1, borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(
        _,
        {
          size: "small",
          placeholder: "Search entitlements...",
          value: B,
          onChange: (z) => O(z.target.value),
          InputProps: {
            startAdornment: /* @__PURE__ */ t(Gt, { position: "start", children: /* @__PURE__ */ t(Vr, { sx: { color: "var(--theme-text-secondary)" } }) })
          },
          sx: { minWidth: 300 }
        }
      ) }),
      /* @__PURE__ */ t(Qe, { children: /* @__PURE__ */ s(Ye, { children: [
        /* @__PURE__ */ t(Xe, { children: /* @__PURE__ */ s(fe, { children: [
          /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Name" }),
          /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Category" }),
          /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Description" }),
          !ge && /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, align: "right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ s(Ze, { children: [
          u.map((z) => /* @__PURE__ */ s(fe, { hover: !0, children: [
            /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ s(f, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
              /* @__PURE__ */ t(Lt, { sx: { fontSize: 18, color: "var(--theme-primary)" } }),
              /* @__PURE__ */ t(F, { variant: "body1", content: z.name, fontWeight: "500" })
            ] }) }),
            /* @__PURE__ */ t(D, { sx: { borderColor: "var(--theme-border)" }, children: z.category ? /* @__PURE__ */ t(
              ne,
              {
                size: "small",
                label: z.category,
                sx: {
                  bgcolor: "var(--theme-primary)20",
                  color: "var(--theme-primary)"
                }
              }
            ) : /* @__PURE__ */ t(F, { variant: "body2", content: "--", customColor: "var(--theme-text-secondary)" }) }),
            /* @__PURE__ */ t(D, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", maxWidth: 300 }, children: z.description || "--" }),
            !ge && /* @__PURE__ */ s(D, { sx: { borderColor: "var(--theme-border)" }, align: "right", children: [
              /* @__PURE__ */ t(Ee, { title: "Edit", children: /* @__PURE__ */ t(Ae, { size: "small", onClick: () => ve(z), children: /* @__PURE__ */ t(zr, { fontSize: "small" }) }) }),
              /* @__PURE__ */ t(Ee, { title: "Delete", children: /* @__PURE__ */ t(Ae, { size: "small", onClick: () => bt(z), sx: { color: "var(--theme-error)" }, children: /* @__PURE__ */ t(_t, { fontSize: "small" }) }) })
            ] })
          ] }, z.id)),
          u.length === 0 && !p && /* @__PURE__ */ t(fe, { children: /* @__PURE__ */ t(D, { colSpan: ge ? 3 : 4, align: "center", sx: { py: 4, color: "var(--theme-text-secondary)" }, children: B ? "No entitlements match your search" : "No entitlements defined" }) })
        ] })
      ] }) })
    ] }) }),
    o && o.sources.length > 0 && /* @__PURE__ */ t(j, { sx: { bgcolor: "var(--theme-surface)", mt: 3 }, children: /* @__PURE__ */ s(R, { children: [
      /* @__PURE__ */ t(F, { variant: "subtitle2", content: "Entitlement Sources", customColor: "var(--theme-text-secondary)", style: { marginBottom: "12px" } }),
      /* @__PURE__ */ t(f, { sx: { display: "flex", flexDirection: "column", gap: 1 }, children: o.sources.map((z, Oe) => /* @__PURE__ */ s(f, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        /* @__PURE__ */ t(
          ne,
          {
            size: "small",
            label: z.primary ? "Primary" : "Additional",
            sx: {
              bgcolor: z.primary ? "var(--theme-primary)20" : "var(--theme-text-secondary)20",
              color: z.primary ? "var(--theme-primary)" : "var(--theme-text-secondary)"
            }
          }
        ),
        /* @__PURE__ */ t(F, { variant: "body1", content: z.name, fontWeight: "500", customColor: "var(--theme-text-primary)" }),
        z.description && /* @__PURE__ */ t(F, { variant: "body2", content: `- ${z.description}`, customColor: "var(--theme-text-secondary)" }),
        z.readonly && /* @__PURE__ */ t(
          ne,
          {
            size: "small",
            icon: /* @__PURE__ */ t(An, { sx: { fontSize: 14 } }),
            label: "Read-only",
            sx: {
              bgcolor: "var(--theme-warning)20",
              color: "var(--theme-warning)"
            }
          }
        )
      ] }, Oe)) }),
      o.cacheEnabled && /* @__PURE__ */ t(f, { sx: { mt: 2, pt: 2, borderTop: 1, borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(F, { variant: "caption", content: `Caching: Enabled (TTL: ${o.cacheTtl}s)`, customColor: "var(--theme-text-secondary)" }) })
    ] }) }),
    !ge && /* @__PURE__ */ s(
      ut,
      {
        open: E,
        onClose: () => b(!1),
        maxWidth: "sm",
        fullWidth: !0,
        children: [
          /* @__PURE__ */ t(mt, { children: "Add Entitlement" }),
          /* @__PURE__ */ t(ft, { children: /* @__PURE__ */ s(f, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [
            /* @__PURE__ */ t(
              _,
              {
                label: "Name",
                fullWidth: !0,
                value: G.name,
                onChange: (z) => d({ ...G, name: z.target.value }),
                placeholder: "e.g., premium, pro, feature:analytics",
                required: !0
              }
            ),
            /* @__PURE__ */ t(
              _,
              {
                label: "Category (Optional)",
                fullWidth: !0,
                value: G.category,
                onChange: (z) => d({ ...G, category: z.target.value }),
                placeholder: "e.g., subscription, feature, access"
              }
            ),
            /* @__PURE__ */ t(
              _,
              {
                label: "Description (Optional)",
                fullWidth: !0,
                multiline: !0,
                rows: 2,
                value: G.description,
                onChange: (z) => d({ ...G, description: z.target.value }),
                placeholder: "Describe what this entitlement grants access to"
              }
            )
          ] }) }),
          /* @__PURE__ */ s(pt, { children: [
            /* @__PURE__ */ t(ie, { variant: "text", label: "Cancel", onClick: () => b(!1) }),
            /* @__PURE__ */ t(
              ie,
              {
                variant: "primary",
                label: "Create",
                onClick: oe,
                disabled: !G.name.trim() || P
              }
            )
          ] })
        ]
      }
    ),
    !ge && L && /* @__PURE__ */ s(
      ut,
      {
        open: N,
        onClose: () => T(!1),
        maxWidth: "sm",
        fullWidth: !0,
        children: [
          /* @__PURE__ */ t(mt, { children: "Edit Entitlement" }),
          /* @__PURE__ */ t(ft, { children: /* @__PURE__ */ s(f, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [
            /* @__PURE__ */ t(
              _,
              {
                label: "Name",
                fullWidth: !0,
                value: L.name,
                disabled: !0,
                helperText: "Name cannot be changed"
              }
            ),
            /* @__PURE__ */ t(
              _,
              {
                label: "Category",
                fullWidth: !0,
                value: L.category || "",
                onChange: (z) => de({ ...L, category: z.target.value })
              }
            ),
            /* @__PURE__ */ t(
              _,
              {
                label: "Description",
                fullWidth: !0,
                multiline: !0,
                rows: 2,
                value: L.description || "",
                onChange: (z) => de({ ...L, description: z.target.value })
              }
            )
          ] }) }),
          /* @__PURE__ */ s(pt, { children: [
            /* @__PURE__ */ t(ie, { variant: "text", label: "Cancel", onClick: () => T(!1) }),
            /* @__PURE__ */ t(
              ie,
              {
                variant: "primary",
                label: "Save",
                onClick: H,
                disabled: P
              }
            )
          ] })
        ]
      }
    ),
    !ge && L && /* @__PURE__ */ s(
      ut,
      {
        open: V,
        onClose: () => U(!1),
        maxWidth: "sm",
        fullWidth: !0,
        children: [
          /* @__PURE__ */ t(mt, { children: "Delete Entitlement" }),
          /* @__PURE__ */ s(ft, { children: [
            /* @__PURE__ */ t(
              F,
              {
                variant: "body1",
                content: `Are you sure you want to delete the entitlement "${L.name}"?`,
                customColor: "var(--theme-text-primary)"
              }
            ),
            /* @__PURE__ */ t(J, { severity: "warning", sx: { mt: 2 }, children: "This will remove the entitlement from all users who currently have it." })
          ] }),
          /* @__PURE__ */ s(pt, { children: [
            /* @__PURE__ */ t(ie, { variant: "text", label: "Cancel", onClick: () => U(!1) }),
            /* @__PURE__ */ t(
              ie,
              {
                variant: "primary",
                color: "error",
                label: "Delete",
                onClick: pe,
                disabled: P
              }
            )
          ] })
        ]
      }
    )
  ] });
}
function Il({
  token: e,
  title: r = "Accept Invitation",
  subtitle: n = "Activate your account",
  successMessage: o = "Your account has been activated successfully!",
  redirectUrl: a,
  redirectLabel: i = "Go to App",
  onSuccess: c,
  onError: l
}) {
  const [h, u] = y(!0), [m, p] = y(null), [v, S] = y(!1), [g, A] = y(null);
  te(() => {
    (async () => {
      let O = e;
      if (O || (O = new URLSearchParams(window.location.search).get("token") || ""), !O) {
        p("No invitation token provided"), u(!1), l == null || l("No invitation token provided");
        return;
      }
      try {
        const E = await K.acceptInvitation(O);
        A(E.user), S(!0), c == null || c(E.user);
      } catch (E) {
        const b = E instanceof Error ? E.message : "Failed to accept invitation";
        p(b), l == null || l(b);
      } finally {
        u(!1);
      }
    })();
  }, [e, c, l]);
  const $ = () => {
    a && (window.location.href = a);
  };
  return /* @__PURE__ */ t(
    f,
    {
      sx: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "var(--theme-background)",
        p: 3
      },
      children: /* @__PURE__ */ t(j, { sx: { maxWidth: 500, width: "100%", bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ s(R, { sx: { p: 4 }, children: [
        /* @__PURE__ */ s(f, { sx: { textAlign: "center", mb: 4 }, children: [
          /* @__PURE__ */ t(F, { variant: "h4", content: r, customColor: "var(--theme-text-primary)", style: { marginBottom: "8px" } }),
          /* @__PURE__ */ t(F, { variant: "body2", content: n, customColor: "var(--theme-text-secondary)" })
        ] }),
        h && /* @__PURE__ */ s(f, { sx: { display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 4 }, children: [
          /* @__PURE__ */ t(re, {}),
          /* @__PURE__ */ t(F, { variant: "body2", content: "Activating your account...", customColor: "var(--theme-text-secondary)" })
        ] }),
        m && !h && /* @__PURE__ */ s(f, { sx: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }, children: [
          /* @__PURE__ */ t(Pe, { sx: { fontSize: 64, color: "var(--theme-error)" } }),
          /* @__PURE__ */ t(J, { severity: "error", sx: { width: "100%" }, children: m }),
          /* @__PURE__ */ t(
            F,
            {
              variant: "body2",
              content: "The invitation may have expired or is invalid. Please contact support.",
              customColor: "var(--theme-text-secondary)",
              style: { textAlign: "center" }
            }
          )
        ] }),
        v && !h && /* @__PURE__ */ s(f, { sx: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }, children: [
          /* @__PURE__ */ t(Ne, { sx: { fontSize: 64, color: "var(--theme-success)" } }),
          /* @__PURE__ */ t(J, { severity: "success", sx: { width: "100%" }, children: o }),
          g && /* @__PURE__ */ s(f, { sx: { width: "100%", textAlign: "center" }, children: [
            /* @__PURE__ */ t(
              F,
              {
                variant: "body1",
                content: `Welcome, ${g.name || g.email}!`,
                customColor: "var(--theme-text-primary)",
                fontWeight: "500",
                style: { marginBottom: "4px" }
              }
            ),
            /* @__PURE__ */ t(
              F,
              {
                variant: "body2",
                content: "Your account is now active and ready to use.",
                customColor: "var(--theme-text-secondary)"
              }
            )
          ] }),
          a && /* @__PURE__ */ t(
            ie,
            {
              variant: "primary",
              label: i,
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
const $l = ({
  title: e,
  icon: r,
  status: n,
  health: o,
  stats: a = [],
  actions: i = [],
  message: c,
  loading: l = !1
}) => {
  const h = n || o || "disabled", u = {
    healthy: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
    disabled: "bg-gray-400"
  }, m = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white"
  };
  return l ? /* @__PURE__ */ t("div", { className: "rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6", children: /* @__PURE__ */ s("div", { className: "animate-pulse", children: [
    /* @__PURE__ */ t("div", { className: "h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" }),
    /* @__PURE__ */ s("div", { className: "space-y-3", children: [
      /* @__PURE__ */ t("div", { className: "h-4 bg-gray-200 dark:bg-gray-700 rounded" }),
      /* @__PURE__ */ t("div", { className: "h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" })
    ] })
  ] }) }) : /* @__PURE__ */ s("div", { className: "rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6", children: [
    /* @__PURE__ */ s("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ s("div", { className: "flex items-center gap-3", children: [
        r && /* @__PURE__ */ t("div", { className: "text-2xl text-gray-600 dark:text-gray-400", children: r }),
        /* @__PURE__ */ s("div", { children: [
          /* @__PURE__ */ t("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: e }),
          c && /* @__PURE__ */ t("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: c })
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
    a.length > 0 && /* @__PURE__ */ t("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4", children: a.map((p, v) => /* @__PURE__ */ t(zt, { ...p }, v)) }),
    i.length > 0 && /* @__PURE__ */ t("div", { className: "flex flex-wrap gap-2 mt-4", children: i.map((p, v) => /* @__PURE__ */ t(
      "button",
      {
        onClick: p.onClick,
        className: `
                px-4 py-2 rounded-md text-sm font-medium
                transition-colors
                ${m[p.variant || "secondary"]}
              `,
        children: p.label
      },
      v
    )) })
  ] });
}, Al = ({
  title: e,
  description: r,
  icon: n,
  searchPlaceholder: o,
  onSearch: a,
  actions: i = [],
  filters: c,
  tabs: l,
  activeTab: h,
  onTabChange: u,
  children: m,
  loading: p = !1,
  breadcrumbs: v
}) => {
  const S = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white"
  };
  return /* @__PURE__ */ s("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
    v && v.length > 0 && /* @__PURE__ */ t("nav", { className: "mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400", children: v.map((g, A) => /* @__PURE__ */ s(vo.Fragment, { children: [
      A > 0 && /* @__PURE__ */ t("span", { children: "/" }),
      g.href ? /* @__PURE__ */ t("a", { href: g.href, className: "hover:text-gray-900 dark:hover:text-gray-100", children: g.label }) : /* @__PURE__ */ t("span", { className: "text-gray-900 dark:text-gray-100 font-medium", children: g.label })
    ] }, A)) }),
    /* @__PURE__ */ t("div", { className: "mb-8", children: /* @__PURE__ */ s("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ s("div", { className: "flex items-start gap-4", children: [
        n && /* @__PURE__ */ t("div", { className: "text-4xl text-gray-600 dark:text-gray-400 mt-1", children: n }),
        /* @__PURE__ */ s("div", { children: [
          /* @__PURE__ */ t("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white", children: e }),
          r && /* @__PURE__ */ t("p", { className: "mt-2 text-gray-600 dark:text-gray-400", children: r })
        ] })
      ] }),
      i.length > 0 && /* @__PURE__ */ t("div", { className: "flex gap-2", children: i.map((g, A) => /* @__PURE__ */ s(
        "button",
        {
          onClick: g.onClick,
          className: `
                    flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
                    transition-colors
                    ${S[g.variant || "secondary"]}
                  `,
          children: [
            g.icon,
            g.label
          ]
        },
        A
      )) })
    ] }) }),
    l && l.length > 0 && /* @__PURE__ */ t("div", { className: "mb-6 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ t("nav", { className: "flex space-x-8", children: l.map((g) => /* @__PURE__ */ t(
      "button",
      {
        onClick: () => u == null ? void 0 : u(g.id),
        className: `
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${h === g.id ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"}
                `,
        children: g.label
      },
      g.id
    )) }) }),
    (a || c) && /* @__PURE__ */ s("div", { className: "mb-6 flex flex-col sm:flex-row gap-4", children: [
      a && /* @__PURE__ */ t("div", { className: "flex-1", children: /* @__PURE__ */ t(
        "input",
        {
          type: "search",
          placeholder: o || "Search...",
          onChange: (g) => a(g.target.value),
          className: `
                  w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-800
                  text-gray-900 dark:text-white
                  placeholder-gray-500 dark:placeholder-gray-400
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                `
        }
      ) }),
      c && /* @__PURE__ */ t("div", { className: "flex gap-2", children: c })
    ] }),
    /* @__PURE__ */ t("div", { className: p ? "opacity-50 pointer-events-none" : "", children: m })
  ] });
}, Tl = ({
  title: e,
  description: r,
  config: n,
  schema: o,
  onSave: a,
  onReset: i,
  loading: c = !1,
  readOnly: l = !1
}) => {
  const [h, u] = y(n), [m, p] = y({}), [v, S] = y(!1), [g, A] = y(!1);
  te(() => {
    u(n);
  }, [n]);
  const $ = (b, N) => b.required && (N == null || N === "") ? `${b.label} is required` : b.pattern && typeof N == "string" && !b.pattern.test(N) ? `${b.label} format is invalid` : b.validate ? b.validate(N) : null, B = (b, N) => {
    u({ ...h, [b]: N }), A(!1), m[b] && p({ ...m, [b]: "" });
  }, O = async () => {
    const b = {};
    if (o.forEach((N) => {
      const T = $(N, h[N.key]);
      T && (b[N.key] = T);
    }), Object.keys(b).length > 0) {
      p(b);
      return;
    }
    S(!0);
    try {
      await a(h), A(!0), setTimeout(() => A(!1), 3e3);
    } catch (N) {
      console.error("Failed to save config:", N);
    } finally {
      S(!1);
    }
  }, E = (b) => {
    var U;
    const N = h[b.key], V = `
      w-full px-3 py-2 rounded-md border
      ${!!m[b.key] ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"}
      bg-white dark:bg-gray-800
      text-gray-900 dark:text-white
      focus:ring-2 focus:border-transparent
      disabled:opacity-50 disabled:cursor-not-allowed
    `;
    switch (b.type) {
      case "boolean":
        return /* @__PURE__ */ s("label", { className: "flex items-center gap-2 cursor-pointer", children: [
          /* @__PURE__ */ t(
            "input",
            {
              type: "checkbox",
              checked: !!N,
              onChange: (L) => B(b.key, L.target.checked),
              disabled: l || c,
              className: "rounded"
            }
          ),
          /* @__PURE__ */ t("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: b.description || "Enable" })
        ] });
      case "select":
        return /* @__PURE__ */ t(
          "select",
          {
            value: String(N ?? ""),
            onChange: (L) => B(b.key, L.target.value),
            disabled: l || c,
            className: V,
            children: (U = b.options) == null ? void 0 : U.map((L) => /* @__PURE__ */ t("option", { value: L.value, children: L.label }, L.value))
          }
        );
      case "textarea":
        return /* @__PURE__ */ t(
          "textarea",
          {
            value: String(N ?? ""),
            onChange: (L) => B(b.key, L.target.value),
            disabled: l || c,
            rows: 4,
            className: V
          }
        );
      case "number":
        return /* @__PURE__ */ t(
          "input",
          {
            type: "number",
            value: Number(N ?? 0),
            onChange: (L) => B(b.key, Number(L.target.value)),
            min: b.min,
            max: b.max,
            step: b.step,
            disabled: l || c,
            className: V
          }
        );
      case "text":
      default:
        return /* @__PURE__ */ t(
          "input",
          {
            type: "text",
            value: String(N ?? ""),
            onChange: (L) => B(b.key, L.target.value),
            disabled: l || c,
            className: V
          }
        );
    }
  };
  return /* @__PURE__ */ s("div", { className: "rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6", children: [
    /* @__PURE__ */ s("div", { className: "mb-6", children: [
      /* @__PURE__ */ t("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: e }),
      r && /* @__PURE__ */ t("p", { className: "mt-1 text-gray-600 dark:text-gray-400", children: r })
    ] }),
    /* @__PURE__ */ t("div", { className: "space-y-6", children: o.map((b) => /* @__PURE__ */ s("div", { children: [
      b.type !== "boolean" && /* @__PURE__ */ s("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: [
        b.label,
        b.required && /* @__PURE__ */ t("span", { className: "text-red-500 ml-1", children: "*" })
      ] }),
      E(b),
      b.description && b.type !== "boolean" && /* @__PURE__ */ t("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: b.description }),
      m[b.key] && /* @__PURE__ */ t("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: m[b.key] })
    ] }, b.key)) }),
    !l && /* @__PURE__ */ s("div", { className: "mt-6 flex items-center gap-3", children: [
      /* @__PURE__ */ t(
        "button",
        {
          onClick: O,
          disabled: v || c,
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
          onClick: i,
          disabled: v || c,
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
      g && /* @__PURE__ */ t("span", { className: "text-sm text-green-600 dark:text-green-400", children: "✓ Saved successfully" })
    ] })
  ] });
};
export {
  Il as AcceptInvitationPage,
  Sl as ControlPanelApp,
  Ws as DashboardPage,
  us as DashboardWidgetProvider,
  ms as DashboardWidgetRenderer,
  Dl as DataTable,
  El as EntitlementsPage,
  Ks as LogsPage,
  cl as NotFoundPage,
  Tl as PluginConfigPanel,
  Al as PluginManagementPage,
  $l as PluginStatusWidget,
  gs as PluginWidgetRenderer,
  vs as ServiceHealthWidget,
  zl as StatCard,
  tl as SystemPage,
  kl as UsersPage,
  fs as WidgetComponentRegistryProvider,
  K as api,
  Rs as getBuiltInWidgetComponents,
  oo as useDashboardWidgets,
  wl as useRegisterWidget,
  ps as useWidgetComponentRegistry
};
//# sourceMappingURL=index.js.map
