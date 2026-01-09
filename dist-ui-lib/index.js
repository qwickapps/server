var la = Object.defineProperty;
var ca = (e, r, n) => r in e ? la(e, r, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[r] = n;
var Ft = (e, r, n) => ca(e, typeof r != "symbol" ? r + "" : r, n);
import { jsxs as d, jsx as t, Fragment as Ue } from "react/jsx-runtime";
import * as _e from "react";
import da, { createContext as In, useState as x, useCallback as ye, useContext as En, useMemo as ha, useEffect as re, useRef as ua } from "react";
import { useNavigate as $n, Routes as ma, Route as $t } from "react-router-dom";
import { Box as f, Typography as I, CircularProgress as le, Alert as ee, Card as _, CardContent as W, Chip as te, LinearProgress as Yt, Button as ze, Divider as An, IconButton as $e, List as fa, ListItem as pa, ListItemText as ga, TextField as F, CardActionArea as ya, Grid as Ce, FormControl as wr, InputLabel as Sr, Select as kr, MenuItem as Ie, ToggleButtonGroup as ba, ToggleButton as qr, Tooltip as Se, TableContainer as Qe, Table as Ye, TableHead as Xe, TableRow as me, TableCell as N, TableBody as Ze, Pagination as va, Snackbar as xa, FormControlLabel as At, Switch as Tt, Collapse as Ca, Dialog as wa, DialogTitle as Sa, DialogContent as ka, DialogActions as Ia, Link as Ea, Tabs as $a, Tab as Aa, InputAdornment as Ht, TablePagination as Ta, Autocomplete as Pa } from "@mui/material";
import { AppConfigBuilder as Na, Text as j, GridLayout as Xt, StatCard as Dt, Button as oe, QwickApp as Da, ProductLogo as za, Dialog as ht, DialogTitle as ut, DialogContent as mt, DialogActions as ft } from "@qwickapps/react-framework";
import { DataTable as Il, StatCard as El } from "@qwickapps/react-framework";
import Y from "prop-types";
import Ba from "@emotion/styled";
import "@emotion/react";
import { isValidElementType as Tn, Memo as Oa, ForwardRef as Ma } from "react-is";
const Ra = Na.create().withName("Control Panel").withId("com.qwickapps.control-panel").withVersion("1.0.0").withDefaultTheme("dark").withDefaultPalette("cosmic").withThemeSwitcher(!0).withPaletteSwitcher(!0).withDisplay("standalone").build(), Jr = (e) => e, La = () => {
  let e = Jr;
  return {
    configure(r) {
      e = r;
    },
    generate(r) {
      return e(r);
    },
    reset() {
      e = Jr;
    }
  };
}, ja = La();
function Fe(e, ...r) {
  const n = new URL(`https://mui.com/production-error/?code=${e}`);
  return r.forEach((a) => n.searchParams.append("args[]", a)), `Minified MUI error #${e}; visit ${n} for the full message.`;
}
function tt(e) {
  if (typeof e != "string")
    throw new Error(process.env.NODE_ENV !== "production" ? "MUI: `capitalize(string)` expects a string argument." : Fe(7));
  return e.charAt(0).toUpperCase() + e.slice(1);
}
function Pn(e) {
  var r, n, a = "";
  if (typeof e == "string" || typeof e == "number") a += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var o = e.length;
    for (r = 0; r < o; r++) e[r] && (n = Pn(e[r])) && (a && (a += " "), a += n);
  } else for (n in e) e[n] && (a && (a += " "), a += n);
  return a;
}
function Nn() {
  for (var e, r, n = 0, a = "", o = arguments.length; n < o; n++) (e = arguments[n]) && (r = Pn(e)) && (a && (a += " "), a += r);
  return a;
}
function Wa(e, r, n = void 0) {
  const a = {};
  for (const o in e) {
    const i = e[o];
    let l = "", c = !0;
    for (let h = 0; h < i.length; h += 1) {
      const u = i[h];
      u && (l += (c === !0 ? "" : " ") + r(u), c = !1, n && n[u] && (l += " " + n[u]));
    }
    a[o] = l;
  }
  return a;
}
function Re(e) {
  if (typeof e != "object" || e === null)
    return !1;
  const r = Object.getPrototypeOf(e);
  return (r === null || r === Object.prototype || Object.getPrototypeOf(r) === null) && !(Symbol.toStringTag in e) && !(Symbol.iterator in e);
}
function Dn(e) {
  if (/* @__PURE__ */ _e.isValidElement(e) || Tn(e) || !Re(e))
    return e;
  const r = {};
  return Object.keys(e).forEach((n) => {
    r[n] = Dn(e[n]);
  }), r;
}
function ke(e, r, n = {
  clone: !0
}) {
  const a = n.clone ? {
    ...e
  } : e;
  return Re(e) && Re(r) && Object.keys(r).forEach((o) => {
    /* @__PURE__ */ _e.isValidElement(r[o]) || Tn(r[o]) ? a[o] = r[o] : Re(r[o]) && // Avoid prototype pollution
    Object.prototype.hasOwnProperty.call(e, o) && Re(e[o]) ? a[o] = ke(e[o], r[o], n) : n.clone ? a[o] = Re(r[o]) ? Dn(r[o]) : r[o] : a[o] = r[o];
  }), a;
}
function Ot(e, r) {
  return r ? ke(e, r, {
    clone: !1
    // No need to clone deep, it's way faster.
  }) : e;
}
const He = process.env.NODE_ENV !== "production" ? Y.oneOfType([Y.number, Y.string, Y.object, Y.array]) : {};
function Qr(e, r) {
  if (!e.containerQueries)
    return r;
  const n = Object.keys(r).filter((a) => a.startsWith("@container")).sort((a, o) => {
    var l, c;
    const i = /min-width:\s*([0-9.]+)/;
    return +(((l = a.match(i)) == null ? void 0 : l[1]) || 0) - +(((c = o.match(i)) == null ? void 0 : c[1]) || 0);
  });
  return n.length ? n.reduce((a, o) => {
    const i = r[o];
    return delete a[o], a[o] = i, a;
  }, {
    ...r
  }) : r;
}
function Ua(e, r) {
  return r === "@" || r.startsWith("@") && (e.some((n) => r.startsWith(`@${n}`)) || !!r.match(/^@\d/));
}
function _a(e, r) {
  const n = r.match(/^@([^/]+)?\/?(.+)?$/);
  if (!n) {
    if (process.env.NODE_ENV !== "production")
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The provided shorthand ${`(${r})`} is invalid. The format should be \`@<breakpoint | number>\` or \`@<breakpoint | number>/<container>\`.
For example, \`@sm\` or \`@600\` or \`@40rem/sidebar\`.` : Fe(18, `(${r})`));
    return null;
  }
  const [, a, o] = n, i = Number.isNaN(+a) ? a || 0 : +a;
  return e.containerQueries(o).up(i);
}
function Fa(e) {
  const r = (i, l) => i.replace("@media", l ? `@container ${l}` : "@container");
  function n(i, l) {
    i.up = (...c) => r(e.breakpoints.up(...c), l), i.down = (...c) => r(e.breakpoints.down(...c), l), i.between = (...c) => r(e.breakpoints.between(...c), l), i.only = (...c) => r(e.breakpoints.only(...c), l), i.not = (...c) => {
      const h = r(e.breakpoints.not(...c), l);
      return h.includes("not all and") ? h.replace("not all and ", "").replace("min-width:", "width<").replace("max-width:", "width>").replace("and", "or") : h;
    };
  }
  const a = {}, o = (i) => (n(a, i), a);
  return n(o), {
    ...e,
    containerQueries: o
  };
}
const Zt = {
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
}, Yr = {
  // Sorted ASC by size. That's important.
  // It can't be configured as it's used statically for propTypes.
  keys: ["xs", "sm", "md", "lg", "xl"],
  up: (e) => `@media (min-width:${Zt[e]}px)`
}, Va = {
  containerQueries: (e) => ({
    up: (r) => {
      let n = typeof r == "number" ? r : Zt[r] || r;
      return typeof n == "number" && (n = `${n}px`), e ? `@container ${e} (min-width:${n})` : `@container (min-width:${n})`;
    }
  })
};
function Le(e, r, n) {
  const a = e.theme || {};
  if (Array.isArray(r)) {
    const i = a.breakpoints || Yr;
    return r.reduce((l, c, h) => (l[i.up(i.keys[h])] = n(r[h]), l), {});
  }
  if (typeof r == "object") {
    const i = a.breakpoints || Yr;
    return Object.keys(r).reduce((l, c) => {
      if (Ua(i.keys, c)) {
        const h = _a(a.containerQueries ? a : Va, c);
        h && (l[h] = n(r[c], c));
      } else if (Object.keys(i.values || Zt).includes(c)) {
        const h = i.up(c);
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
function Ha(e = {}) {
  var n;
  return ((n = e.keys) == null ? void 0 : n.reduce((a, o) => {
    const i = e.up(o);
    return a[i] = {}, a;
  }, {})) || {};
}
function Xr(e, r) {
  return e.reduce((n, a) => {
    const o = n[a];
    return (!o || Object.keys(o).length === 0) && delete n[a], n;
  }, r);
}
function er(e, r, n = !0) {
  if (!r || typeof r != "string")
    return null;
  if (e && e.vars && n) {
    const a = `vars.${r}`.split(".").reduce((o, i) => o && o[i] ? o[i] : null, e);
    if (a != null)
      return a;
  }
  return r.split(".").reduce((a, o) => a && a[o] != null ? a[o] : null, e);
}
function Kt(e, r, n, a = n) {
  let o;
  return typeof e == "function" ? o = e(n) : Array.isArray(e) ? o = e[n] || a : o = er(e, n) || a, r && (o = r(o, a, e)), o;
}
function ce(e) {
  const {
    prop: r,
    cssProperty: n = e.prop,
    themeKey: a,
    transform: o
  } = e, i = (l) => {
    if (l[r] == null)
      return null;
    const c = l[r], h = l.theme, u = er(h, a) || {};
    return Le(l, c, (p) => {
      let C = Kt(u, o, p);
      return p === C && typeof p == "string" && (C = Kt(u, o, `${r}${p === "default" ? "" : tt(p)}`, p)), n === !1 ? C : {
        [n]: C
      };
    });
  };
  return i.propTypes = process.env.NODE_ENV !== "production" ? {
    [r]: He
  } : {}, i.filterProps = [r], i;
}
function Ga(e) {
  const r = {};
  return (n) => (r[n] === void 0 && (r[n] = e(n)), r[n]);
}
const Ka = {
  m: "margin",
  p: "padding"
}, qa = {
  t: "Top",
  r: "Right",
  b: "Bottom",
  l: "Left",
  x: ["Left", "Right"],
  y: ["Top", "Bottom"]
}, Zr = {
  marginX: "mx",
  marginY: "my",
  paddingX: "px",
  paddingY: "py"
}, Ja = Ga((e) => {
  if (e.length > 2)
    if (Zr[e])
      e = Zr[e];
    else
      return [e];
  const [r, n] = e.split(""), a = Ka[r], o = qa[n] || "";
  return Array.isArray(o) ? o.map((i) => a + i) : [a + o];
}), tr = ["m", "mt", "mr", "mb", "ml", "mx", "my", "margin", "marginTop", "marginRight", "marginBottom", "marginLeft", "marginX", "marginY", "marginInline", "marginInlineStart", "marginInlineEnd", "marginBlock", "marginBlockStart", "marginBlockEnd"], rr = ["p", "pt", "pr", "pb", "pl", "px", "py", "padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "paddingX", "paddingY", "paddingInline", "paddingInlineStart", "paddingInlineEnd", "paddingBlock", "paddingBlockStart", "paddingBlockEnd"], Qa = [...tr, ...rr];
function Wt(e, r, n, a) {
  const o = er(e, r, !0) ?? n;
  return typeof o == "number" || typeof o == "string" ? (i) => typeof i == "string" ? i : (process.env.NODE_ENV !== "production" && typeof i != "number" && console.error(`MUI: Expected ${a} argument to be a number or a string, got ${i}.`), typeof o == "string" ? o.startsWith("var(") && i === 0 ? 0 : o.startsWith("var(") && i === 1 ? o : `calc(${i} * ${o})` : o * i) : Array.isArray(o) ? (i) => {
    if (typeof i == "string")
      return i;
    const l = Math.abs(i);
    process.env.NODE_ENV !== "production" && (Number.isInteger(l) ? l > o.length - 1 && console.error([`MUI: The value provided (${l}) overflows.`, `The supported values are: ${JSON.stringify(o)}.`, `${l} > ${o.length - 1}, you need to add the missing values.`].join(`
`)) : console.error([`MUI: The \`theme.${r}\` array type cannot be combined with non integer values.You should either use an integer value that can be used as index, or define the \`theme.${r}\` as a number.`].join(`
`)));
    const c = o[l];
    return i >= 0 ? c : typeof c == "number" ? -c : typeof c == "string" && c.startsWith("var(") ? `calc(-1 * ${c})` : `-${c}`;
  } : typeof o == "function" ? o : (process.env.NODE_ENV !== "production" && console.error([`MUI: The \`theme.${r}\` value (${o}) is invalid.`, "It should be a number, an array or a function."].join(`
`)), () => {
  });
}
function zr(e) {
  return Wt(e, "spacing", 8, "spacing");
}
function Ut(e, r) {
  return typeof r == "string" || r == null ? r : e(r);
}
function Ya(e, r) {
  return (n) => e.reduce((a, o) => (a[o] = Ut(r, n), a), {});
}
function Xa(e, r, n, a) {
  if (!r.includes(n))
    return null;
  const o = Ja(n), i = Ya(o, a), l = e[n];
  return Le(e, l, i);
}
function zn(e, r) {
  const n = zr(e.theme);
  return Object.keys(e).map((a) => Xa(e, r, a, n)).reduce(Ot, {});
}
function ie(e) {
  return zn(e, tr);
}
ie.propTypes = process.env.NODE_ENV !== "production" ? tr.reduce((e, r) => (e[r] = He, e), {}) : {};
ie.filterProps = tr;
function se(e) {
  return zn(e, rr);
}
se.propTypes = process.env.NODE_ENV !== "production" ? rr.reduce((e, r) => (e[r] = He, e), {}) : {};
se.filterProps = rr;
process.env.NODE_ENV !== "production" && Qa.reduce((e, r) => (e[r] = He, e), {});
function nr(...e) {
  const r = e.reduce((a, o) => (o.filterProps.forEach((i) => {
    a[i] = o;
  }), a), {}), n = (a) => Object.keys(a).reduce((o, i) => r[i] ? Ot(o, r[i](a)) : o, {});
  return n.propTypes = process.env.NODE_ENV !== "production" ? e.reduce((a, o) => Object.assign(a, o.propTypes), {}) : {}, n.filterProps = e.reduce((a, o) => a.concat(o.filterProps), []), n;
}
function Ee(e) {
  return typeof e != "number" ? e : `${e}px solid`;
}
function Ae(e, r) {
  return ce({
    prop: e,
    themeKey: "borders",
    transform: r
  });
}
const Za = Ae("border", Ee), eo = Ae("borderTop", Ee), to = Ae("borderRight", Ee), ro = Ae("borderBottom", Ee), no = Ae("borderLeft", Ee), ao = Ae("borderColor"), oo = Ae("borderTopColor"), io = Ae("borderRightColor"), so = Ae("borderBottomColor"), lo = Ae("borderLeftColor"), co = Ae("outline", Ee), ho = Ae("outlineColor"), ar = (e) => {
  if (e.borderRadius !== void 0 && e.borderRadius !== null) {
    const r = Wt(e.theme, "shape.borderRadius", 4, "borderRadius"), n = (a) => ({
      borderRadius: Ut(r, a)
    });
    return Le(e, e.borderRadius, n);
  }
  return null;
};
ar.propTypes = process.env.NODE_ENV !== "production" ? {
  borderRadius: He
} : {};
ar.filterProps = ["borderRadius"];
nr(Za, eo, to, ro, no, ao, oo, io, so, lo, ar, co, ho);
const or = (e) => {
  if (e.gap !== void 0 && e.gap !== null) {
    const r = Wt(e.theme, "spacing", 8, "gap"), n = (a) => ({
      gap: Ut(r, a)
    });
    return Le(e, e.gap, n);
  }
  return null;
};
or.propTypes = process.env.NODE_ENV !== "production" ? {
  gap: He
} : {};
or.filterProps = ["gap"];
const ir = (e) => {
  if (e.columnGap !== void 0 && e.columnGap !== null) {
    const r = Wt(e.theme, "spacing", 8, "columnGap"), n = (a) => ({
      columnGap: Ut(r, a)
    });
    return Le(e, e.columnGap, n);
  }
  return null;
};
ir.propTypes = process.env.NODE_ENV !== "production" ? {
  columnGap: He
} : {};
ir.filterProps = ["columnGap"];
const sr = (e) => {
  if (e.rowGap !== void 0 && e.rowGap !== null) {
    const r = Wt(e.theme, "spacing", 8, "rowGap"), n = (a) => ({
      rowGap: Ut(r, a)
    });
    return Le(e, e.rowGap, n);
  }
  return null;
};
sr.propTypes = process.env.NODE_ENV !== "production" ? {
  rowGap: He
} : {};
sr.filterProps = ["rowGap"];
const uo = ce({
  prop: "gridColumn"
}), mo = ce({
  prop: "gridRow"
}), fo = ce({
  prop: "gridAutoFlow"
}), po = ce({
  prop: "gridAutoColumns"
}), go = ce({
  prop: "gridAutoRows"
}), yo = ce({
  prop: "gridTemplateColumns"
}), bo = ce({
  prop: "gridTemplateRows"
}), vo = ce({
  prop: "gridTemplateAreas"
}), xo = ce({
  prop: "gridArea"
});
nr(or, ir, sr, uo, mo, fo, po, go, yo, bo, vo, xo);
function pt(e, r) {
  return r === "grey" ? r : e;
}
const Co = ce({
  prop: "color",
  themeKey: "palette",
  transform: pt
}), wo = ce({
  prop: "bgcolor",
  cssProperty: "backgroundColor",
  themeKey: "palette",
  transform: pt
}), So = ce({
  prop: "backgroundColor",
  themeKey: "palette",
  transform: pt
});
nr(Co, wo, So);
function we(e) {
  return e <= 1 && e !== 0 ? `${e * 100}%` : e;
}
const ko = ce({
  prop: "width",
  transform: we
}), Br = (e) => {
  if (e.maxWidth !== void 0 && e.maxWidth !== null) {
    const r = (n) => {
      var o, i, l, c, h;
      const a = ((l = (i = (o = e.theme) == null ? void 0 : o.breakpoints) == null ? void 0 : i.values) == null ? void 0 : l[n]) || Zt[n];
      return a ? ((h = (c = e.theme) == null ? void 0 : c.breakpoints) == null ? void 0 : h.unit) !== "px" ? {
        maxWidth: `${a}${e.theme.breakpoints.unit}`
      } : {
        maxWidth: a
      } : {
        maxWidth: we(n)
      };
    };
    return Le(e, e.maxWidth, r);
  }
  return null;
};
Br.filterProps = ["maxWidth"];
const Io = ce({
  prop: "minWidth",
  transform: we
}), Eo = ce({
  prop: "height",
  transform: we
}), $o = ce({
  prop: "maxHeight",
  transform: we
}), Ao = ce({
  prop: "minHeight",
  transform: we
});
ce({
  prop: "size",
  cssProperty: "width",
  transform: we
});
ce({
  prop: "size",
  cssProperty: "height",
  transform: we
});
const To = ce({
  prop: "boxSizing"
});
nr(ko, Br, Io, Eo, $o, Ao, To);
const lr = {
  // borders
  border: {
    themeKey: "borders",
    transform: Ee
  },
  borderTop: {
    themeKey: "borders",
    transform: Ee
  },
  borderRight: {
    themeKey: "borders",
    transform: Ee
  },
  borderBottom: {
    themeKey: "borders",
    transform: Ee
  },
  borderLeft: {
    themeKey: "borders",
    transform: Ee
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
    transform: Ee
  },
  outlineColor: {
    themeKey: "palette"
  },
  borderRadius: {
    themeKey: "shape.borderRadius",
    style: ar
  },
  // palette
  color: {
    themeKey: "palette",
    transform: pt
  },
  bgcolor: {
    themeKey: "palette",
    cssProperty: "backgroundColor",
    transform: pt
  },
  backgroundColor: {
    themeKey: "palette",
    transform: pt
  },
  // spacing
  p: {
    style: se
  },
  pt: {
    style: se
  },
  pr: {
    style: se
  },
  pb: {
    style: se
  },
  pl: {
    style: se
  },
  px: {
    style: se
  },
  py: {
    style: se
  },
  padding: {
    style: se
  },
  paddingTop: {
    style: se
  },
  paddingRight: {
    style: se
  },
  paddingBottom: {
    style: se
  },
  paddingLeft: {
    style: se
  },
  paddingX: {
    style: se
  },
  paddingY: {
    style: se
  },
  paddingInline: {
    style: se
  },
  paddingInlineStart: {
    style: se
  },
  paddingInlineEnd: {
    style: se
  },
  paddingBlock: {
    style: se
  },
  paddingBlockStart: {
    style: se
  },
  paddingBlockEnd: {
    style: se
  },
  m: {
    style: ie
  },
  mt: {
    style: ie
  },
  mr: {
    style: ie
  },
  mb: {
    style: ie
  },
  ml: {
    style: ie
  },
  mx: {
    style: ie
  },
  my: {
    style: ie
  },
  margin: {
    style: ie
  },
  marginTop: {
    style: ie
  },
  marginRight: {
    style: ie
  },
  marginBottom: {
    style: ie
  },
  marginLeft: {
    style: ie
  },
  marginX: {
    style: ie
  },
  marginY: {
    style: ie
  },
  marginInline: {
    style: ie
  },
  marginInlineStart: {
    style: ie
  },
  marginInlineEnd: {
    style: ie
  },
  marginBlock: {
    style: ie
  },
  marginBlockStart: {
    style: ie
  },
  marginBlockEnd: {
    style: ie
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
    style: or
  },
  rowGap: {
    style: sr
  },
  columnGap: {
    style: ir
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
    transform: we
  },
  maxWidth: {
    style: Br
  },
  minWidth: {
    transform: we
  },
  height: {
    transform: we
  },
  maxHeight: {
    transform: we
  },
  minHeight: {
    transform: we
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
function Po(...e) {
  const r = e.reduce((a, o) => a.concat(Object.keys(o)), []), n = new Set(r);
  return e.every((a) => n.size === Object.keys(a).length);
}
function No(e, r) {
  return typeof e == "function" ? e(r) : e;
}
function Do() {
  function e(n, a, o, i) {
    const l = {
      [n]: a,
      theme: o
    }, c = i[n];
    if (!c)
      return {
        [n]: a
      };
    const {
      cssProperty: h = n,
      themeKey: u,
      transform: m,
      style: p
    } = c;
    if (a == null)
      return null;
    if (u === "typography" && a === "inherit")
      return {
        [n]: a
      };
    const C = er(o, u) || {};
    return p ? p(l) : Le(l, a, (y) => {
      let A = Kt(C, m, y);
      return y === A && typeof y == "string" && (A = Kt(C, m, `${n}${y === "default" ? "" : tt(y)}`, y)), h === !1 ? A : {
        [h]: A
      };
    });
  }
  function r(n) {
    const {
      sx: a,
      theme: o = {},
      nested: i
    } = n || {};
    if (!a)
      return null;
    const l = o.unstable_sxConfig ?? lr;
    function c(h) {
      let u = h;
      if (typeof h == "function")
        u = h(o);
      else if (typeof h != "object")
        return h;
      if (!u)
        return null;
      const m = Ha(o.breakpoints), p = Object.keys(m);
      let C = m;
      return Object.keys(u).forEach((S) => {
        const y = No(u[S], o);
        if (y != null)
          if (typeof y == "object")
            if (l[S])
              C = Ot(C, e(S, y, o, l));
            else {
              const A = Le({
                theme: o
              }, y, (E) => ({
                [S]: E
              }));
              Po(A, y) ? C[S] = r({
                sx: y,
                theme: o,
                nested: !0
              }) : C = Ot(C, A);
            }
          else
            C = Ot(C, e(S, y, o, l));
      }), !i && o.modularCssLayers ? {
        "@layer sx": Qr(o, Xr(p, C))
      } : Qr(o, Xr(p, C));
    }
    return Array.isArray(a) ? a.map(c) : c(a);
  }
  return r;
}
const gt = Do();
gt.filterProps = ["sx"];
function zo(e) {
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
var Bo = {
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
function Oo(e) {
  var r = /* @__PURE__ */ Object.create(null);
  return function(n) {
    return r[n] === void 0 && (r[n] = e(n)), r[n];
  };
}
var Mo = /[A-Z]|^ms/g, Ro = /_EMO_([^_]+?)_([^]*?)_EMO_/g, Bn = function(r) {
  return r.charCodeAt(1) === 45;
}, en = function(r) {
  return r != null && typeof r != "boolean";
}, fr = /* @__PURE__ */ Oo(function(e) {
  return Bn(e) ? e : e.replace(Mo, "-$&").toLowerCase();
}), tn = function(r, n) {
  switch (r) {
    case "animation":
    case "animationName":
      if (typeof n == "string")
        return n.replace(Ro, function(a, o, i) {
          return We = {
            name: o,
            styles: i,
            next: We
          }, o;
        });
  }
  return Bo[r] !== 1 && !Bn(r) && typeof n == "number" && n !== 0 ? n + "px" : n;
};
function qt(e, r, n) {
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
        return We = {
          name: o.name,
          styles: o.styles,
          next: We
        }, o.name;
      var i = n;
      if (i.styles !== void 0) {
        var l = i.next;
        if (l !== void 0)
          for (; l !== void 0; )
            We = {
              name: l.name,
              styles: l.styles,
              next: We
            }, l = l.next;
        var c = i.styles + ";";
        return c;
      }
      return Lo(e, r, n);
    }
  }
  var h = n;
  return h;
}
function Lo(e, r, n) {
  var a = "";
  if (Array.isArray(n))
    for (var o = 0; o < n.length; o++)
      a += qt(e, r, n[o]) + ";";
  else
    for (var i in n) {
      var l = n[i];
      if (typeof l != "object") {
        var c = l;
        en(c) && (a += fr(i) + ":" + tn(i, c) + ";");
      } else if (Array.isArray(l) && typeof l[0] == "string" && r == null)
        for (var h = 0; h < l.length; h++)
          en(l[h]) && (a += fr(i) + ":" + tn(i, l[h]) + ";");
      else {
        var u = qt(e, r, l);
        switch (i) {
          case "animation":
          case "animationName": {
            a += fr(i) + ":" + u + ";";
            break;
          }
          default:
            a += i + "{" + u + "}";
        }
      }
    }
  return a;
}
var rn = /label:\s*([^\s;{]+)\s*(;|$)/g, We;
function jo(e, r, n) {
  if (e.length === 1 && typeof e[0] == "object" && e[0] !== null && e[0].styles !== void 0)
    return e[0];
  var a = !0, o = "";
  We = void 0;
  var i = e[0];
  if (i == null || i.raw === void 0)
    a = !1, o += qt(n, r, i);
  else {
    var l = i;
    o += l[0];
  }
  for (var c = 1; c < e.length; c++)
    if (o += qt(n, r, e[c]), a) {
      var h = i;
      o += h[c];
    }
  rn.lastIndex = 0;
  for (var u = "", m; (m = rn.exec(o)) !== null; )
    u += "-" + m[1];
  var p = zo(o) + u;
  return {
    name: p,
    styles: o,
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
function Wo(e, r) {
  const n = Ba(e, r);
  return process.env.NODE_ENV !== "production" ? (...a) => {
    const o = typeof e == "string" ? `"${e}"` : "component";
    return a.length === 0 ? console.error([`MUI: Seems like you called \`styled(${o})()\` without a \`style\` argument.`, 'You must provide a `styles` argument: `styled("div")(styleYouForgotToPass)`.'].join(`
`)) : a.some((i) => i === void 0) && console.error(`MUI: the styled(${o})(...args) API requires all its args to be defined.`), n(...a);
  } : n;
}
function Uo(e, r) {
  Array.isArray(e.__emotion_styles) && (e.__emotion_styles = r(e.__emotion_styles));
}
const nn = [];
function et(e) {
  return nn[0] = e, jo(nn);
}
const _o = (e) => {
  const r = Object.keys(e).map((n) => ({
    key: n,
    val: e[n]
  })) || [];
  return r.sort((n, a) => n.val - a.val), r.reduce((n, a) => ({
    ...n,
    [a.key]: a.val
  }), {});
};
function Fo(e) {
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
  } = e, i = _o(r), l = Object.keys(i);
  function c(C) {
    return `@media (min-width:${typeof r[C] == "number" ? r[C] : C}${n})`;
  }
  function h(C) {
    return `@media (max-width:${(typeof r[C] == "number" ? r[C] : C) - a / 100}${n})`;
  }
  function u(C, S) {
    const y = l.indexOf(S);
    return `@media (min-width:${typeof r[C] == "number" ? r[C] : C}${n}) and (max-width:${(y !== -1 && typeof r[l[y]] == "number" ? r[l[y]] : S) - a / 100}${n})`;
  }
  function m(C) {
    return l.indexOf(C) + 1 < l.length ? u(C, l[l.indexOf(C) + 1]) : c(C);
  }
  function p(C) {
    const S = l.indexOf(C);
    return S === 0 ? c(l[1]) : S === l.length - 1 ? h(l[S]) : u(C, l[l.indexOf(C) + 1]).replace("@media", "@media not all and");
  }
  return {
    keys: l,
    values: i,
    up: c,
    down: h,
    between: u,
    only: m,
    not: p,
    unit: n,
    ...o
  };
}
const Vo = {
  borderRadius: 4
};
function On(e = 8, r = zr({
  spacing: e
})) {
  if (e.mui)
    return e;
  const n = (...a) => (process.env.NODE_ENV !== "production" && (a.length <= 4 || console.error(`MUI: Too many arguments provided, expected between 0 and 4, got ${a.length}`)), (a.length === 0 ? [1] : a).map((i) => {
    const l = r(i);
    return typeof l == "number" ? `${l}px` : l;
  }).join(" "));
  return n.mui = !0, n;
}
function Ho(e, r) {
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
function Mn(e = {}, ...r) {
  const {
    breakpoints: n = {},
    palette: a = {},
    spacing: o,
    shape: i = {},
    ...l
  } = e, c = Fo(n), h = On(o);
  let u = ke({
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
      ...Vo,
      ...i
    }
  }, l);
  return u = Fa(u), u.applyStyles = Ho, u = r.reduce((m, p) => ke(m, p), u), u.unstable_sxConfig = {
    ...lr,
    ...l == null ? void 0 : l.unstable_sxConfig
  }, u.unstable_sx = function(p) {
    return gt({
      sx: p,
      theme: this
    });
  }, u;
}
const Go = {
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
function Or(e, r, n = "Mui") {
  const a = Go[r];
  return a ? `${n}-${a}` : `${ja.generate(e)}-${r}`;
}
function Ko(e, r, n = "Mui") {
  const a = {};
  return r.forEach((o) => {
    a[o] = Or(e, o, n);
  }), a;
}
function Rn(e, r = "") {
  return e.displayName || e.name || r;
}
function an(e, r, n) {
  const a = Rn(r);
  return e.displayName || (a !== "" ? `${n}(${a})` : n);
}
function qo(e) {
  if (e != null) {
    if (typeof e == "string")
      return e;
    if (typeof e == "function")
      return Rn(e, "Component");
    if (typeof e == "object")
      switch (e.$$typeof) {
        case Ma:
          return an(e, e.render, "ForwardRef");
        case Oa:
          return an(e, e.type, "memo");
        default:
          return;
      }
  }
}
function Ln(e) {
  const {
    variants: r,
    ...n
  } = e, a = {
    variants: r,
    style: et(n),
    isProcessed: !0
  };
  return a.style === n || r && r.forEach((o) => {
    typeof o.style != "function" && (o.style = et(o.style));
  }), a;
}
const Jo = Mn();
function pr(e) {
  return e !== "ownerState" && e !== "theme" && e !== "sx" && e !== "as";
}
function Je(e, r) {
  return r && e && typeof e == "object" && e.styles && !e.styles.startsWith("@layer") && (e.styles = `@layer ${r}{${String(e.styles)}}`), e;
}
function Qo(e) {
  return e ? (r, n) => n[e] : null;
}
function Yo(e, r, n) {
  e.theme = ti(e.theme) ? n : e.theme[r] || e.theme;
}
function Gt(e, r, n) {
  const a = typeof r == "function" ? r(e) : r;
  if (Array.isArray(a))
    return a.flatMap((o) => Gt(e, o, n));
  if (Array.isArray(a == null ? void 0 : a.variants)) {
    let o;
    if (a.isProcessed)
      o = n ? Je(a.style, n) : a.style;
    else {
      const {
        variants: i,
        ...l
      } = a;
      o = n ? Je(et(l), n) : l;
    }
    return jn(e, a.variants, [o], n);
  }
  return a != null && a.isProcessed ? n ? Je(et(a.style), n) : a.style : n ? Je(et(a), n) : a;
}
function jn(e, r, n = [], a = void 0) {
  var i;
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
        if (e[h] !== c.props[h] && ((i = e.ownerState) == null ? void 0 : i[h]) !== c.props[h])
          continue e;
    typeof c.style == "function" ? (o ?? (o = {
      ...e,
      ...e.ownerState,
      ownerState: e.ownerState
    }), n.push(a ? Je(et(c.style(o)), a) : c.style(o))) : n.push(a ? Je(et(c.style), a) : c.style);
  }
  return n;
}
function Xo(e = {}) {
  const {
    themeId: r,
    defaultTheme: n = Jo,
    rootShouldForwardProp: a = pr,
    slotShouldForwardProp: o = pr
  } = e;
  function i(c) {
    Yo(c, r, n);
  }
  return (c, h = {}) => {
    Uo(c, (T) => T.filter((V) => V !== gt));
    const {
      name: u,
      slot: m,
      skipVariantsResolver: p,
      skipSx: C,
      // TODO v6: remove `lowercaseFirstLetter()` in the next major release
      // For more details: https://github.com/mui/material-ui/pull/37908
      overridesResolver: S = Qo(Wn(m)),
      ...y
    } = h, A = u && u.startsWith("Mui") || m ? "components" : "custom", E = p !== void 0 ? p : (
      // TODO v6: remove `Root` in the next major release
      // For more details: https://github.com/mui/material-ui/pull/37908
      m && m !== "Root" && m !== "root" || !1
    ), R = C || !1;
    let O = pr;
    m === "Root" || m === "root" ? O = a : m ? O = o : ri(c) && (O = void 0);
    const $ = Wo(c, {
      shouldForwardProp: O,
      label: ei(u, m),
      ...y
    }), g = (T) => {
      if (T.__emotion_real === T)
        return T;
      if (typeof T == "function")
        return function(U) {
          return Gt(U, T, U.theme.modularCssLayers ? A : void 0);
        };
      if (Re(T)) {
        const V = Ln(T);
        return function(M) {
          return V.variants ? Gt(M, V, M.theme.modularCssLayers ? A : void 0) : M.theme.modularCssLayers ? Je(V.style, A) : V.style;
        };
      }
      return T;
    }, z = (...T) => {
      const V = [], U = T.map(g), M = [];
      if (V.push(i), u && S && M.push(function(P) {
        var ne, H;
        const B = (H = (ne = P.theme.components) == null ? void 0 : ne[u]) == null ? void 0 : H.styleOverrides;
        if (!B)
          return null;
        const L = {};
        for (const fe in B)
          L[fe] = Gt(P, B[fe], P.theme.modularCssLayers ? "theme" : void 0);
        return S(P, L);
      }), u && !E && M.push(function(P) {
        var L, ne;
        const b = P.theme, B = (ne = (L = b == null ? void 0 : b.components) == null ? void 0 : L[u]) == null ? void 0 : ne.variants;
        return B ? jn(P, B, [], P.theme.modularCssLayers ? "theme" : void 0) : null;
      }), R || M.push(gt), Array.isArray(U[0])) {
        const s = U.shift(), P = new Array(V.length).fill(""), b = new Array(M.length).fill("");
        let B;
        B = [...P, ...s, ...b], B.raw = [...P, ...s.raw, ...b], V.unshift(B);
      }
      const de = [...V, ...U, ...M], K = $(...de);
      return c.muiName && (K.muiName = c.muiName), process.env.NODE_ENV !== "production" && (K.displayName = Zo(u, m, c)), K;
    };
    return $.withConfig && (z.withConfig = $.withConfig), z;
  };
}
function Zo(e, r, n) {
  return e ? `${e}${tt(r || "")}` : `Styled(${qo(n)})`;
}
function ei(e, r) {
  let n;
  return process.env.NODE_ENV !== "production" && e && (n = `${e}-${Wn(r || "Root")}`), n;
}
function ti(e) {
  for (const r in e)
    return !1;
  return !0;
}
function ri(e) {
  return typeof e == "string" && // 96 is one less than the char code
  // for "a" so this is checking that
  // it's a lowercase character
  e.charCodeAt(0) > 96;
}
function Wn(e) {
  return e && e.charAt(0).toLowerCase() + e.slice(1);
}
function Ir(e, r, n = !1) {
  const a = {
    ...r
  };
  for (const o in e)
    if (Object.prototype.hasOwnProperty.call(e, o)) {
      const i = o;
      if (i === "components" || i === "slots")
        a[i] = {
          ...e[i],
          ...a[i]
        };
      else if (i === "componentsProps" || i === "slotProps") {
        const l = e[i], c = r[i];
        if (!c)
          a[i] = l || {};
        else if (!l)
          a[i] = c;
        else {
          a[i] = {
            ...c
          };
          for (const h in l)
            if (Object.prototype.hasOwnProperty.call(l, h)) {
              const u = h;
              a[i][u] = Ir(l[u], c[u], n);
            }
        }
      } else i === "className" && n && r.className ? a.className = Nn(e == null ? void 0 : e.className, r == null ? void 0 : r.className) : i === "style" && n && r.style ? a.style = {
        ...e == null ? void 0 : e.style,
        ...r == null ? void 0 : r.style
      } : a[i] === void 0 && (a[i] = e[i]);
    }
  return a;
}
function ni(e, r = Number.MIN_SAFE_INTEGER, n = Number.MAX_SAFE_INTEGER) {
  return Math.max(r, Math.min(e, n));
}
function Mr(e, r = 0, n = 1) {
  return process.env.NODE_ENV !== "production" && (e < r || e > n) && console.error(`MUI: The value provided ${e} is out of range [${r}, ${n}].`), ni(e, r, n);
}
function ai(e) {
  e = e.slice(1);
  const r = new RegExp(`.{1,${e.length >= 6 ? 2 : 1}}`, "g");
  let n = e.match(r);
  return n && n[0].length === 1 && (n = n.map((a) => a + a)), process.env.NODE_ENV !== "production" && e.length !== e.trim().length && console.error(`MUI: The color: "${e}" is invalid. Make sure the color input doesn't contain leading/trailing space.`), n ? `rgb${n.length === 4 ? "a" : ""}(${n.map((a, o) => o < 3 ? parseInt(a, 16) : Math.round(parseInt(a, 16) / 255 * 1e3) / 1e3).join(", ")})` : "";
}
function Ve(e) {
  if (e.type)
    return e;
  if (e.charAt(0) === "#")
    return Ve(ai(e));
  const r = e.indexOf("("), n = e.substring(0, r);
  if (!["rgb", "rgba", "hsl", "hsla", "color"].includes(n))
    throw new Error(process.env.NODE_ENV !== "production" ? `MUI: Unsupported \`${e}\` color.
The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().` : Fe(9, e));
  let a = e.substring(r + 1, e.length - 1), o;
  if (n === "color") {
    if (a = a.split(" "), o = a.shift(), a.length === 4 && a[3].charAt(0) === "/" && (a[3] = a[3].slice(1)), !["srgb", "display-p3", "a98-rgb", "prophoto-rgb", "rec-2020"].includes(o))
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: unsupported \`${o}\` color space.
The following color spaces are supported: srgb, display-p3, a98-rgb, prophoto-rgb, rec-2020.` : Fe(10, o));
  } else
    a = a.split(",");
  return a = a.map((i) => parseFloat(i)), {
    type: n,
    values: a,
    colorSpace: o
  };
}
const oi = (e) => {
  const r = Ve(e);
  return r.values.slice(0, 3).map((n, a) => r.type.includes("hsl") && a !== 0 ? `${n}%` : n).join(" ");
}, zt = (e, r) => {
  try {
    return oi(e);
  } catch {
    return r && process.env.NODE_ENV !== "production" && console.warn(r), e;
  }
};
function cr(e) {
  const {
    type: r,
    colorSpace: n
  } = e;
  let {
    values: a
  } = e;
  return r.includes("rgb") ? a = a.map((o, i) => i < 3 ? parseInt(o, 10) : o) : r.includes("hsl") && (a[1] = `${a[1]}%`, a[2] = `${a[2]}%`), r.includes("color") ? a = `${n} ${a.join(" ")}` : a = `${a.join(", ")}`, `${r}(${a})`;
}
function Un(e) {
  e = Ve(e);
  const {
    values: r
  } = e, n = r[0], a = r[1] / 100, o = r[2] / 100, i = a * Math.min(o, 1 - o), l = (u, m = (u + n / 30) % 12) => o - i * Math.max(Math.min(m - 3, 9 - m, 1), -1);
  let c = "rgb";
  const h = [Math.round(l(0) * 255), Math.round(l(8) * 255), Math.round(l(4) * 255)];
  return e.type === "hsla" && (c += "a", h.push(r[3])), cr({
    type: c,
    values: h
  });
}
function Er(e) {
  e = Ve(e);
  let r = e.type === "hsl" || e.type === "hsla" ? Ve(Un(e)).values : e.values;
  return r = r.map((n) => (e.type !== "color" && (n /= 255), n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4)), Number((0.2126 * r[0] + 0.7152 * r[1] + 0.0722 * r[2]).toFixed(3));
}
function on(e, r) {
  const n = Er(e), a = Er(r);
  return (Math.max(n, a) + 0.05) / (Math.min(n, a) + 0.05);
}
function _n(e, r) {
  return e = Ve(e), r = Mr(r), (e.type === "rgb" || e.type === "hsl") && (e.type += "a"), e.type === "color" ? e.values[3] = `/${r}` : e.values[3] = r, cr(e);
}
function qe(e, r, n) {
  try {
    return _n(e, r);
  } catch {
    return n && process.env.NODE_ENV !== "production" && console.warn(n), e;
  }
}
function dr(e, r) {
  if (e = Ve(e), r = Mr(r), e.type.includes("hsl"))
    e.values[2] *= 1 - r;
  else if (e.type.includes("rgb") || e.type.includes("color"))
    for (let n = 0; n < 3; n += 1)
      e.values[n] *= 1 - r;
  return cr(e);
}
function X(e, r, n) {
  try {
    return dr(e, r);
  } catch {
    return n && process.env.NODE_ENV !== "production" && console.warn(n), e;
  }
}
function hr(e, r) {
  if (e = Ve(e), r = Mr(r), e.type.includes("hsl"))
    e.values[2] += (100 - e.values[2]) * r;
  else if (e.type.includes("rgb"))
    for (let n = 0; n < 3; n += 1)
      e.values[n] += (255 - e.values[n]) * r;
  else if (e.type.includes("color"))
    for (let n = 0; n < 3; n += 1)
      e.values[n] += (1 - e.values[n]) * r;
  return cr(e);
}
function Z(e, r, n) {
  try {
    return hr(e, r);
  } catch {
    return n && process.env.NODE_ENV !== "production" && console.warn(n), e;
  }
}
function ii(e, r = 0.15) {
  return Er(e) > 0.5 ? dr(e, r) : hr(e, r);
}
function Vt(e, r, n) {
  try {
    return ii(e, r);
  } catch {
    return e;
  }
}
const si = /* @__PURE__ */ _e.createContext(void 0);
process.env.NODE_ENV !== "production" && (Y.node, Y.object);
function li(e) {
  const {
    theme: r,
    name: n,
    props: a
  } = e;
  if (!r || !r.components || !r.components[n])
    return a;
  const o = r.components[n];
  return o.defaultProps ? Ir(o.defaultProps, a, r.components.mergeClassNameAndStyle) : !o.styleOverrides && !o.variants ? Ir(o, a, r.components.mergeClassNameAndStyle) : a;
}
function ci({
  props: e,
  name: r
}) {
  const n = _e.useContext(si);
  return li({
    props: e,
    name: r,
    theme: {
      components: n
    }
  });
}
const sn = {
  theme: void 0
};
function di(e) {
  let r, n;
  return function(o) {
    let i = r;
    return (i === void 0 || o.theme !== n) && (sn.theme = o.theme, i = Ln(e(sn)), r = i, n = o.theme), i;
  };
}
function hi(e = "") {
  function r(...a) {
    if (!a.length)
      return "";
    const o = a[0];
    return typeof o == "string" && !o.match(/(#|\(|\)|(-?(\d*\.)?\d+)(px|em|%|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc))|^(-?(\d*\.)?\d+)$|(\d+ \d+ \d+)/) ? `, var(--${e ? `${e}-` : ""}${o}${r(...a.slice(1))})` : `, ${o}`;
  }
  return (a, ...o) => `var(--${e ? `${e}-` : ""}${a}${r(...o)})`;
}
const ln = (e, r, n, a = []) => {
  let o = e;
  r.forEach((i, l) => {
    l === r.length - 1 ? Array.isArray(o) ? o[Number(i)] = n : o && typeof o == "object" && (o[i] = n) : o && typeof o == "object" && (o[i] || (o[i] = a.includes(i) ? [] : {}), o = o[i]);
  });
}, ui = (e, r, n) => {
  function a(o, i = [], l = []) {
    Object.entries(o).forEach(([c, h]) => {
      (!n || n && !n([...i, c])) && h != null && (typeof h == "object" && Object.keys(h).length > 0 ? a(h, [...i, c], Array.isArray(h) ? [...l, c] : l) : r([...i, c], h, l));
    });
  }
  a(e);
}, mi = (e, r) => typeof r == "number" ? ["lineHeight", "fontWeight", "opacity", "zIndex"].some((a) => e.includes(a)) || e[e.length - 1].toLowerCase().includes("opacity") ? r : `${r}px` : r;
function gr(e, r) {
  const {
    prefix: n,
    shouldSkipGeneratingVar: a
  } = r || {}, o = {}, i = {}, l = {};
  return ui(
    e,
    (c, h, u) => {
      if ((typeof h == "string" || typeof h == "number") && (!a || !a(c, h))) {
        const m = `--${n ? `${n}-` : ""}${c.join("-")}`, p = mi(c, h);
        Object.assign(o, {
          [m]: p
        }), ln(i, c, `var(${m})`, u), ln(l, c, `var(${m}, ${p})`, u);
      }
    },
    (c) => c[0] === "vars"
    // skip 'vars/*' paths
  ), {
    css: o,
    vars: i,
    varsWithDefaults: l
  };
}
function fi(e, r = {}) {
  const {
    getSelector: n = R,
    disableCssColorScheme: a,
    colorSchemeSelector: o,
    enableContrastVars: i
  } = r, {
    colorSchemes: l = {},
    components: c,
    defaultColorScheme: h = "light",
    ...u
  } = e, {
    vars: m,
    css: p,
    varsWithDefaults: C
  } = gr(u, r);
  let S = C;
  const y = {}, {
    [h]: A,
    ...E
  } = l;
  if (Object.entries(E || {}).forEach(([g, z]) => {
    const {
      vars: T,
      css: V,
      varsWithDefaults: U
    } = gr(z, r);
    S = ke(S, U), y[g] = {
      css: V,
      vars: T
    };
  }), A) {
    const {
      css: g,
      vars: z,
      varsWithDefaults: T
    } = gr(A, r);
    S = ke(S, T), y[h] = {
      css: g,
      vars: z
    };
  }
  function R(g, z) {
    var V, U;
    let T = o;
    if (o === "class" && (T = ".%s"), o === "data" && (T = "[data-%s]"), o != null && o.startsWith("data-") && !o.includes("%s") && (T = `[${o}="%s"]`), g) {
      if (T === "media")
        return e.defaultColorScheme === g ? ":root" : {
          [`@media (prefers-color-scheme: ${((U = (V = l[g]) == null ? void 0 : V.palette) == null ? void 0 : U.mode) || g})`]: {
            ":root": z
          }
        };
      if (T)
        return e.defaultColorScheme === g ? `:root, ${T.replace("%s", String(g))}` : T.replace("%s", String(g));
    }
    return ":root";
  }
  return {
    vars: S,
    generateThemeVars: () => {
      let g = {
        ...m
      };
      return Object.entries(y).forEach(([, {
        vars: z
      }]) => {
        g = ke(g, z);
      }), g;
    },
    generateStyleSheets: () => {
      var M, de;
      const g = [], z = e.defaultColorScheme || "light";
      function T(K, s) {
        Object.keys(s).length && g.push(typeof K == "string" ? {
          [K]: {
            ...s
          }
        } : K);
      }
      T(n(void 0, {
        ...p
      }), p);
      const {
        [z]: V,
        ...U
      } = y;
      if (V) {
        const {
          css: K
        } = V, s = (de = (M = l[z]) == null ? void 0 : M.palette) == null ? void 0 : de.mode, P = !a && s ? {
          colorScheme: s,
          ...K
        } : {
          ...K
        };
        T(n(z, {
          ...P
        }), P);
      }
      return Object.entries(U).forEach(([K, {
        css: s
      }]) => {
        var B, L;
        const P = (L = (B = l[K]) == null ? void 0 : B.palette) == null ? void 0 : L.mode, b = !a && P ? {
          colorScheme: P,
          ...s
        } : {
          ...s
        };
        T(n(K, {
          ...b
        }), b);
      }), i && g.push({
        ":root": {
          // use double underscore to indicate that these are private variables
          "--__l-threshold": "0.7",
          "--__l": "clamp(0, (l / var(--__l-threshold) - 1) * -infinity, 1)",
          "--__a": "clamp(0.87, (l / var(--__l-threshold) - 1) * -infinity, 1)"
          // 0.87 is the default alpha value for black text.
        }
      }), g;
    }
  };
}
function pi(e) {
  return function(n) {
    return e === "media" ? (process.env.NODE_ENV !== "production" && n !== "light" && n !== "dark" && console.error(`MUI: @media (prefers-color-scheme) supports only 'light' or 'dark', but receive '${n}'.`), `@media (prefers-color-scheme: ${n})`) : e ? e.startsWith("data-") && !e.includes("%s") ? `[${e}="${n}"] &` : e === "class" ? `.${n} &` : e === "data" ? `[data-${n}] &` : `${e.replace("%s", n)} &` : "&";
  };
}
const Rt = {
  black: "#000",
  white: "#fff"
}, gi = {
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
}, it = {
  50: "#f3e5f5",
  200: "#ce93d8",
  300: "#ba68c8",
  400: "#ab47bc",
  500: "#9c27b0",
  700: "#7b1fa2"
}, st = {
  300: "#e57373",
  400: "#ef5350",
  500: "#f44336",
  700: "#d32f2f",
  800: "#c62828"
}, Pt = {
  300: "#ffb74d",
  400: "#ffa726",
  500: "#ff9800",
  700: "#f57c00",
  900: "#e65100"
}, lt = {
  50: "#e3f2fd",
  200: "#90caf9",
  400: "#42a5f5",
  700: "#1976d2",
  800: "#1565c0"
}, ct = {
  300: "#4fc3f7",
  400: "#29b6f6",
  500: "#03a9f4",
  700: "#0288d1",
  900: "#01579b"
}, dt = {
  300: "#81c784",
  400: "#66bb6a",
  500: "#4caf50",
  700: "#388e3c",
  800: "#2e7d32",
  900: "#1b5e20"
};
function Fn() {
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
const Vn = Fn();
function Hn() {
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
const $r = Hn();
function cn(e, r, n, a) {
  const o = a.light || a, i = a.dark || a * 1.5;
  e[r] || (e.hasOwnProperty(n) ? e[r] = e[n] : r === "light" ? e.light = hr(e.main, o) : r === "dark" && (e.dark = dr(e.main, i)));
}
function dn(e, r, n, a, o) {
  const i = o.light || o, l = o.dark || o * 1.5;
  r[n] || (r.hasOwnProperty(a) ? r[n] = r[a] : n === "light" ? r.light = `color-mix(in ${e}, ${r.main}, #fff ${(i * 100).toFixed(0)}%)` : n === "dark" && (r.dark = `color-mix(in ${e}, ${r.main}, #000 ${(l * 100).toFixed(0)}%)`));
}
function yi(e = "light") {
  return e === "dark" ? {
    main: lt[200],
    light: lt[50],
    dark: lt[400]
  } : {
    main: lt[700],
    light: lt[400],
    dark: lt[800]
  };
}
function bi(e = "light") {
  return e === "dark" ? {
    main: it[200],
    light: it[50],
    dark: it[400]
  } : {
    main: it[500],
    light: it[300],
    dark: it[700]
  };
}
function vi(e = "light") {
  return e === "dark" ? {
    main: st[500],
    light: st[300],
    dark: st[700]
  } : {
    main: st[700],
    light: st[400],
    dark: st[800]
  };
}
function xi(e = "light") {
  return e === "dark" ? {
    main: ct[400],
    light: ct[300],
    dark: ct[700]
  } : {
    main: ct[700],
    light: ct[500],
    dark: ct[900]
  };
}
function Ci(e = "light") {
  return e === "dark" ? {
    main: dt[400],
    light: dt[300],
    dark: dt[700]
  } : {
    main: dt[800],
    light: dt[500],
    dark: dt[900]
  };
}
function wi(e = "light") {
  return e === "dark" ? {
    main: Pt[400],
    light: Pt[300],
    dark: Pt[700]
  } : {
    main: "#ed6c02",
    // closest to orange[800] that pass 3:1.
    light: Pt[500],
    dark: Pt[900]
  };
}
function Si(e) {
  return `oklch(from ${e} var(--__l) 0 h / var(--__a))`;
}
function Rr(e) {
  const {
    mode: r = "light",
    contrastThreshold: n = 3,
    tonalOffset: a = 0.2,
    colorSpace: o,
    ...i
  } = e, l = e.primary || yi(r), c = e.secondary || bi(r), h = e.error || vi(r), u = e.info || xi(r), m = e.success || Ci(r), p = e.warning || wi(r);
  function C(E) {
    if (o)
      return Si(E);
    const R = on(E, $r.text.primary) >= n ? $r.text.primary : Vn.text.primary;
    if (process.env.NODE_ENV !== "production") {
      const O = on(E, R);
      O < 3 && console.error([`MUI: The contrast ratio of ${O}:1 for ${R} on ${E}`, "falls below the WCAG recommended absolute minimum contrast ratio of 3:1.", "https://www.w3.org/TR/2008/REC-WCAG20-20081211/#visual-audio-contrast-contrast"].join(`
`));
    }
    return R;
  }
  const S = ({
    color: E,
    name: R,
    mainShade: O = 500,
    lightShade: $ = 300,
    darkShade: g = 700
  }) => {
    if (E = {
      ...E
    }, !E.main && E[O] && (E.main = E[O]), !E.hasOwnProperty("main"))
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The color${R ? ` (${R})` : ""} provided to augmentColor(color) is invalid.
The color object needs to have a \`main\` property or a \`${O}\` property.` : Fe(11, R ? ` (${R})` : "", O));
    if (typeof E.main != "string")
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The color${R ? ` (${R})` : ""} provided to augmentColor(color) is invalid.
\`color.main\` should be a string, but \`${JSON.stringify(E.main)}\` was provided instead.

Did you intend to use one of the following approaches?

import { green } from "@mui/material/colors";

const theme1 = createTheme({ palette: {
  primary: green,
} });

const theme2 = createTheme({ palette: {
  primary: { main: green[500] },
} });` : Fe(12, R ? ` (${R})` : "", JSON.stringify(E.main)));
    return o ? (dn(o, E, "light", $, a), dn(o, E, "dark", g, a)) : (cn(E, "light", $, a), cn(E, "dark", g, a)), E.contrastText || (E.contrastText = C(E.main)), E;
  };
  let y;
  return r === "light" ? y = Fn() : r === "dark" && (y = Hn()), process.env.NODE_ENV !== "production" && (y || console.error(`MUI: The palette mode \`${r}\` is not supported.`)), ke({
    // A collection of common colors.
    common: {
      ...Rt
    },
    // prevent mutable object.
    // The palette mode, can be light or dark.
    mode: r,
    // The colors used to represent primary interface elements for a user.
    primary: S({
      color: l,
      name: "primary"
    }),
    // The colors used to represent secondary interface elements for a user.
    secondary: S({
      color: c,
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
    grey: gi,
    // Used by `getContrastText()` to maximize the contrast between
    // the background and the text.
    contrastThreshold: n,
    // Takes a background color and returns the text color that maximizes the contrast.
    getContrastText: C,
    // Generate a rich color object.
    augmentColor: S,
    // Used by the functions below to shift a color's luminance by approximately
    // two indexes within its tonal palette.
    // E.g., shift from Red 500 to Red 300 or Red 700.
    tonalOffset: a,
    // The light and dark mode object.
    ...y
  }, i);
}
function ki(e) {
  const r = {};
  return Object.entries(e).forEach((a) => {
    const [o, i] = a;
    typeof i == "object" && (r[o] = `${i.fontStyle ? `${i.fontStyle} ` : ""}${i.fontVariant ? `${i.fontVariant} ` : ""}${i.fontWeight ? `${i.fontWeight} ` : ""}${i.fontStretch ? `${i.fontStretch} ` : ""}${i.fontSize || ""}${i.lineHeight ? `/${i.lineHeight} ` : ""}${i.fontFamily || ""}`);
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
function Ei(e) {
  return Math.round(e * 1e5) / 1e5;
}
const hn = {
  textTransform: "uppercase"
}, un = '"Roboto", "Helvetica", "Arial", sans-serif';
function $i(e, r) {
  const {
    fontFamily: n = un,
    // The default font size of the Material Specification.
    fontSize: a = 14,
    // px
    fontWeightLight: o = 300,
    fontWeightRegular: i = 400,
    fontWeightMedium: l = 500,
    fontWeightBold: c = 700,
    // Tell MUI what's the font-size on the html element.
    // 16px is the default font-size used by browsers.
    htmlFontSize: h = 16,
    // Apply the CSS properties to all the variants.
    allVariants: u,
    pxToRem: m,
    ...p
  } = typeof r == "function" ? r(e) : r;
  process.env.NODE_ENV !== "production" && (typeof a != "number" && console.error("MUI: `fontSize` is required to be a number."), typeof h != "number" && console.error("MUI: `htmlFontSize` is required to be a number."));
  const C = a / 14, S = m || ((E) => `${E / h * C}rem`), y = (E, R, O, $, g) => ({
    fontFamily: n,
    fontWeight: E,
    fontSize: S(R),
    // Unitless following https://meyerweb.com/eric/thoughts/2006/02/08/unitless-line-heights/
    lineHeight: O,
    // The letter spacing was designed for the Roboto font-family. Using the same letter-spacing
    // across font-families can cause issues with the kerning.
    ...n === un ? {
      letterSpacing: `${Ei($ / R)}em`
    } : {},
    ...g,
    ...u
  }), A = {
    h1: y(o, 96, 1.167, -1.5),
    h2: y(o, 60, 1.2, -0.5),
    h3: y(i, 48, 1.167, 0),
    h4: y(i, 34, 1.235, 0.25),
    h5: y(i, 24, 1.334, 0),
    h6: y(l, 20, 1.6, 0.15),
    subtitle1: y(i, 16, 1.75, 0.15),
    subtitle2: y(l, 14, 1.57, 0.1),
    body1: y(i, 16, 1.5, 0.15),
    body2: y(i, 14, 1.43, 0.15),
    button: y(l, 14, 1.75, 0.4, hn),
    caption: y(i, 12, 1.66, 0.4),
    overline: y(i, 12, 2.66, 1, hn),
    // TODO v6: Remove handling of 'inherit' variant from the theme as it is already handled in Material UI's Typography component. Also, remember to remove the associated types.
    inherit: {
      fontFamily: "inherit",
      fontWeight: "inherit",
      fontSize: "inherit",
      lineHeight: "inherit",
      letterSpacing: "inherit"
    }
  };
  return ke({
    htmlFontSize: h,
    pxToRem: S,
    fontFamily: n,
    fontSize: a,
    fontWeightLight: o,
    fontWeightRegular: i,
    fontWeightMedium: l,
    fontWeightBold: c,
    ...A
  }, p, {
    clone: !1
    // No need to clone deep
  });
}
const Ai = 0.2, Ti = 0.14, Pi = 0.12;
function ae(...e) {
  return [`${e[0]}px ${e[1]}px ${e[2]}px ${e[3]}px rgba(0,0,0,${Ai})`, `${e[4]}px ${e[5]}px ${e[6]}px ${e[7]}px rgba(0,0,0,${Ti})`, `${e[8]}px ${e[9]}px ${e[10]}px ${e[11]}px rgba(0,0,0,${Pi})`].join(",");
}
const Ni = ["none", ae(0, 2, 1, -1, 0, 1, 1, 0, 0, 1, 3, 0), ae(0, 3, 1, -2, 0, 2, 2, 0, 0, 1, 5, 0), ae(0, 3, 3, -2, 0, 3, 4, 0, 0, 1, 8, 0), ae(0, 2, 4, -1, 0, 4, 5, 0, 0, 1, 10, 0), ae(0, 3, 5, -1, 0, 5, 8, 0, 0, 1, 14, 0), ae(0, 3, 5, -1, 0, 6, 10, 0, 0, 1, 18, 0), ae(0, 4, 5, -2, 0, 7, 10, 1, 0, 2, 16, 1), ae(0, 5, 5, -3, 0, 8, 10, 1, 0, 3, 14, 2), ae(0, 5, 6, -3, 0, 9, 12, 1, 0, 3, 16, 2), ae(0, 6, 6, -3, 0, 10, 14, 1, 0, 4, 18, 3), ae(0, 6, 7, -4, 0, 11, 15, 1, 0, 4, 20, 3), ae(0, 7, 8, -4, 0, 12, 17, 2, 0, 5, 22, 4), ae(0, 7, 8, -4, 0, 13, 19, 2, 0, 5, 24, 4), ae(0, 7, 9, -4, 0, 14, 21, 2, 0, 5, 26, 4), ae(0, 8, 9, -5, 0, 15, 22, 2, 0, 6, 28, 5), ae(0, 8, 10, -5, 0, 16, 24, 2, 0, 6, 30, 5), ae(0, 8, 11, -5, 0, 17, 26, 2, 0, 6, 32, 5), ae(0, 9, 11, -5, 0, 18, 28, 2, 0, 7, 34, 6), ae(0, 9, 12, -6, 0, 19, 29, 2, 0, 7, 36, 6), ae(0, 10, 13, -6, 0, 20, 31, 3, 0, 8, 38, 7), ae(0, 10, 13, -6, 0, 21, 33, 3, 0, 8, 40, 7), ae(0, 10, 14, -6, 0, 22, 35, 3, 0, 8, 42, 7), ae(0, 11, 14, -7, 0, 23, 36, 3, 0, 9, 44, 8), ae(0, 11, 15, -7, 0, 24, 38, 3, 0, 9, 46, 8)], Di = {
  // This is the most common easing curve.
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  // Objects enter the screen at full velocity from off-screen and
  // slowly decelerate to a resting point.
  easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
  // Objects leave the screen at full velocity. They do not decelerate when off-screen.
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  // The sharp curve is used by objects that may return to the screen at any time.
  sharp: "cubic-bezier(0.4, 0, 0.6, 1)"
}, zi = {
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
function mn(e) {
  return `${Math.round(e)}ms`;
}
function Bi(e) {
  if (!e)
    return 0;
  const r = e / 36;
  return Math.min(Math.round((4 + 15 * r ** 0.25 + r / 5) * 10), 3e3);
}
function Oi(e) {
  const r = {
    ...Di,
    ...e.easing
  }, n = {
    ...zi,
    ...e.duration
  };
  return {
    getAutoHeightDuration: Bi,
    create: (o = ["all"], i = {}) => {
      const {
        duration: l = n.standard,
        easing: c = r.easeInOut,
        delay: h = 0,
        ...u
      } = i;
      if (process.env.NODE_ENV !== "production") {
        const m = (C) => typeof C == "string", p = (C) => !Number.isNaN(parseFloat(C));
        !m(o) && !Array.isArray(o) && console.error('MUI: Argument "props" must be a string or Array.'), !p(l) && !m(l) && console.error(`MUI: Argument "duration" must be a number or a string but found ${l}.`), m(c) || console.error('MUI: Argument "easing" must be a string.'), !p(h) && !m(h) && console.error('MUI: Argument "delay" must be a number or a string.'), typeof i != "object" && console.error(["MUI: Secong argument of transition.create must be an object.", "Arguments should be either `create('prop1', options)` or `create(['prop1', 'prop2'], options)`"].join(`
`)), Object.keys(u).length !== 0 && console.error(`MUI: Unrecognized argument(s) [${Object.keys(u).join(",")}].`);
      }
      return (Array.isArray(o) ? o : [o]).map((m) => `${m} ${typeof l == "string" ? l : mn(l)} ${c} ${typeof h == "string" ? h : mn(h)}`).join(",");
    },
    ...e,
    easing: r,
    duration: n
  };
}
const Mi = {
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
  return Re(e) || typeof e > "u" || typeof e == "string" || typeof e == "boolean" || typeof e == "number" || Array.isArray(e);
}
function Gn(e = {}) {
  const r = {
    ...e
  };
  function n(a) {
    const o = Object.entries(a);
    for (let i = 0; i < o.length; i++) {
      const [l, c] = o[i];
      !Ri(c) || l.startsWith("unstable_") ? delete a[l] : Re(c) && (a[l] = {
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
function fn(e) {
  return typeof e == "number" ? `${(e * 100).toFixed(0)}%` : `calc((${e}) * 100%)`;
}
const Li = (e) => {
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
function ji(e) {
  Object.assign(e, {
    alpha(r, n) {
      const a = this || e;
      return a.colorSpace ? `oklch(from ${r} l c h / ${typeof n == "string" ? `calc(${n})` : n})` : a.vars ? `rgba(${r.replace(/var\(--([^,\s)]+)(?:,[^)]+)?\)+/g, "var(--$1Channel)")} / ${typeof n == "string" ? `calc(${n})` : n})` : _n(r, Li(n));
    },
    lighten(r, n) {
      const a = this || e;
      return a.colorSpace ? `color-mix(in ${a.colorSpace}, ${r}, #fff ${fn(n)})` : hr(r, n);
    },
    darken(r, n) {
      const a = this || e;
      return a.colorSpace ? `color-mix(in ${a.colorSpace}, ${r}, #000 ${fn(n)})` : dr(r, n);
    }
  });
}
function Ar(e = {}, ...r) {
  const {
    breakpoints: n,
    mixins: a = {},
    spacing: o,
    palette: i = {},
    transitions: l = {},
    typography: c = {},
    shape: h,
    colorSpace: u,
    ...m
  } = e;
  if (e.vars && // The error should throw only for the root theme creation because user is not allowed to use a custom node `vars`.
  // `generateThemeVars` is the closest identifier for checking that the `options` is a result of `createTheme` with CSS variables so that user can create new theme for nested ThemeProvider.
  e.generateThemeVars === void 0)
    throw new Error(process.env.NODE_ENV !== "production" ? "MUI: `vars` is a private field used for CSS variables support.\nPlease use another name or follow the [docs](https://mui.com/material-ui/customization/css-theme-variables/usage/) to enable the feature." : Fe(20));
  const p = Rr({
    ...i,
    colorSpace: u
  }), C = Mn(e);
  let S = ke(C, {
    mixins: Ii(C.breakpoints, a),
    palette: p,
    // Don't use [...shadows] until you've verified its transpiled code is not invoking the iterator protocol.
    shadows: Ni.slice(),
    typography: $i(p, c),
    transitions: Oi(l),
    zIndex: {
      ...Mi
    }
  });
  if (S = ke(S, m), S = r.reduce((y, A) => ke(y, A), S), process.env.NODE_ENV !== "production") {
    const y = ["active", "checked", "completed", "disabled", "error", "expanded", "focused", "focusVisible", "required", "selected"], A = (E, R) => {
      let O;
      for (O in E) {
        const $ = E[O];
        if (y.includes(O) && Object.keys($).length > 0) {
          if (process.env.NODE_ENV !== "production") {
            const g = Or("", O);
            console.error([`MUI: The \`${R}\` component increases the CSS specificity of the \`${O}\` internal state.`, "You can not override it like this: ", JSON.stringify(E, null, 2), "", `Instead, you need to use the '&.${g}' syntax:`, JSON.stringify({
              root: {
                [`&.${g}`]: $
              }
            }, null, 2), "", "https://mui.com/r/state-classes-guide"].join(`
`));
          }
          E[O] = {};
        }
      }
    };
    Object.keys(S.components).forEach((E) => {
      const R = S.components[E].styleOverrides;
      R && E.startsWith("Mui") && A(R, E);
    });
  }
  return S.unstable_sxConfig = {
    ...lr,
    ...m == null ? void 0 : m.unstable_sxConfig
  }, S.unstable_sx = function(A) {
    return gt({
      sx: A,
      theme: this
    });
  }, S.toRuntimeSource = Gn, ji(S), S;
}
function Wi(e) {
  let r;
  return e < 1 ? r = 5.11916 * e ** 2 : r = 4.5 * Math.log(e + 1) + 2, Math.round(r * 10) / 1e3;
}
const Ui = [...Array(25)].map((e, r) => {
  if (r === 0)
    return "none";
  const n = Wi(r);
  return `linear-gradient(rgba(255 255 255 / ${n}), rgba(255 255 255 / ${n}))`;
});
function Kn(e) {
  return {
    inputPlaceholder: e === "dark" ? 0.5 : 0.42,
    inputUnderline: e === "dark" ? 0.7 : 0.42,
    switchTrackDisabled: e === "dark" ? 0.2 : 0.12,
    switchTrack: e === "dark" ? 0.3 : 0.38
  };
}
function qn(e) {
  return e === "dark" ? Ui : [];
}
function _i(e) {
  const {
    palette: r = {
      mode: "light"
    },
    // need to cast to avoid module augmentation test
    opacity: n,
    overlays: a,
    colorSpace: o,
    ...i
  } = e, l = Rr({
    ...r,
    colorSpace: o
  });
  return {
    palette: l,
    opacity: {
      ...Kn(l.mode),
      ...n
    },
    overlays: a || qn(l.mode),
    ...i
  };
}
function Fi(e) {
  var r;
  return !!e[0].match(/(cssVarPrefix|colorSchemeSelector|modularCssLayers|rootSelector|typography|mixins|breakpoints|direction|transitions)/) || !!e[0].match(/sxConfig$/) || // ends with sxConfig
  e[0] === "palette" && !!((r = e[1]) != null && r.match(/(mode|contrastThreshold|tonalOffset)/));
}
const Vi = (e) => [...[...Array(25)].map((r, n) => `--${e ? `${e}-` : ""}overlays-${n}`), `--${e ? `${e}-` : ""}palette-AppBar-darkBg`, `--${e ? `${e}-` : ""}palette-AppBar-darkColor`], Hi = (e) => (r, n) => {
  const a = e.rootSelector || ":root", o = e.colorSchemeSelector;
  let i = o;
  if (o === "class" && (i = ".%s"), o === "data" && (i = "[data-%s]"), o != null && o.startsWith("data-") && !o.includes("%s") && (i = `[${o}="%s"]`), e.defaultColorScheme === r) {
    if (r === "dark") {
      const l = {};
      return Vi(e.cssVarPrefix).forEach((c) => {
        l[c] = n[c], delete n[c];
      }), i === "media" ? {
        [a]: n,
        "@media (prefers-color-scheme: dark)": {
          [a]: l
        }
      } : i ? {
        [i.replace("%s", r)]: l,
        [`${a}, ${i.replace("%s", r)}`]: n
      } : {
        [a]: {
          ...n,
          ...l
        }
      };
    }
    if (i && i !== "media")
      return `${a}, ${i.replace("%s", String(r))}`;
  } else if (r) {
    if (i === "media")
      return {
        [`@media (prefers-color-scheme: ${String(r)})`]: {
          [a]: n
        }
      };
    if (i)
      return i.replace("%s", String(r));
  }
  return a;
};
function Gi(e, r) {
  r.forEach((n) => {
    e[n] || (e[n] = {});
  });
}
function v(e, r, n) {
  !e[r] && n && (e[r] = n);
}
function Bt(e) {
  return typeof e != "string" || !e.startsWith("hsl") ? e : Un(e);
}
function Me(e, r) {
  `${r}Channel` in e || (e[`${r}Channel`] = zt(Bt(e[r]), `MUI: Can't create \`palette.${r}Channel\` because \`palette.${r}\` is not one of these formats: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().
To suppress this warning, you need to explicitly provide the \`palette.${r}Channel\` as a string (in rgb format, for example "12 12 12") or undefined if you want to remove the channel token.`));
}
function Ki(e) {
  return typeof e == "number" ? `${e}px` : typeof e == "string" || typeof e == "function" || Array.isArray(e) ? e : "8px";
}
const De = (e) => {
  try {
    return e();
  } catch {
  }
}, qi = (e = "mui") => hi(e);
function yr(e, r, n, a, o) {
  if (!n)
    return;
  n = n === !0 ? {} : n;
  const i = o === "dark" ? "dark" : "light";
  if (!a) {
    r[o] = _i({
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
    palette: l,
    ...c
  } = Ar({
    ...a,
    palette: {
      mode: i,
      ...n == null ? void 0 : n.palette
    },
    colorSpace: e
  });
  return r[o] = {
    ...n,
    palette: l,
    opacity: {
      ...Kn(i),
      ...n == null ? void 0 : n.opacity
    },
    overlays: (n == null ? void 0 : n.overlays) || qn(i)
  }, c;
}
function Ji(e = {}, ...r) {
  const {
    colorSchemes: n = {
      light: !0
    },
    defaultColorScheme: a,
    disableCssColorScheme: o = !1,
    cssVarPrefix: i = "mui",
    nativeColor: l = !1,
    shouldSkipGeneratingVar: c = Fi,
    colorSchemeSelector: h = n.light && n.dark ? "media" : void 0,
    rootSelector: u = ":root",
    ...m
  } = e, p = Object.keys(n)[0], C = a || (n.light && p !== "light" ? "light" : p), S = qi(i), {
    [C]: y,
    light: A,
    dark: E,
    ...R
  } = n, O = {
    ...R
  };
  let $ = y;
  if ((C === "dark" && !("dark" in n) || C === "light" && !("light" in n)) && ($ = !0), !$)
    throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The \`colorSchemes.${C}\` option is either missing or invalid.` : Fe(21, C));
  let g;
  l && (g = "oklch");
  const z = yr(g, O, $, m, C);
  A && !O.light && yr(g, O, A, void 0, "light"), E && !O.dark && yr(g, O, E, void 0, "dark");
  let T = {
    defaultColorScheme: C,
    ...z,
    cssVarPrefix: i,
    colorSchemeSelector: h,
    rootSelector: u,
    getCssVar: S,
    colorSchemes: O,
    font: {
      ...ki(z.typography),
      ...z.font
    },
    spacing: Ki(m.spacing)
  };
  Object.keys(T.colorSchemes).forEach((K) => {
    const s = T.colorSchemes[K].palette, P = (B) => {
      const L = B.split("-"), ne = L[1], H = L[2];
      return S(B, s[ne][H]);
    };
    s.mode === "light" && (v(s.common, "background", "#fff"), v(s.common, "onBackground", "#000")), s.mode === "dark" && (v(s.common, "background", "#000"), v(s.common, "onBackground", "#fff"));
    function b(B, L, ne) {
      if (g) {
        let H;
        return B === qe && (H = `transparent ${((1 - ne) * 100).toFixed(0)}%`), B === X && (H = `#000 ${(ne * 100).toFixed(0)}%`), B === Z && (H = `#fff ${(ne * 100).toFixed(0)}%`), `color-mix(in ${g}, ${L}, ${H})`;
      }
      return B(L, ne);
    }
    if (Gi(s, ["Alert", "AppBar", "Avatar", "Button", "Chip", "FilledInput", "LinearProgress", "Skeleton", "Slider", "SnackbarContent", "SpeedDialAction", "StepConnector", "StepContent", "Switch", "TableCell", "Tooltip"]), s.mode === "light") {
      v(s.Alert, "errorColor", b(X, s.error.light, 0.6)), v(s.Alert, "infoColor", b(X, s.info.light, 0.6)), v(s.Alert, "successColor", b(X, s.success.light, 0.6)), v(s.Alert, "warningColor", b(X, s.warning.light, 0.6)), v(s.Alert, "errorFilledBg", P("palette-error-main")), v(s.Alert, "infoFilledBg", P("palette-info-main")), v(s.Alert, "successFilledBg", P("palette-success-main")), v(s.Alert, "warningFilledBg", P("palette-warning-main")), v(s.Alert, "errorFilledColor", De(() => s.getContrastText(s.error.main))), v(s.Alert, "infoFilledColor", De(() => s.getContrastText(s.info.main))), v(s.Alert, "successFilledColor", De(() => s.getContrastText(s.success.main))), v(s.Alert, "warningFilledColor", De(() => s.getContrastText(s.warning.main))), v(s.Alert, "errorStandardBg", b(Z, s.error.light, 0.9)), v(s.Alert, "infoStandardBg", b(Z, s.info.light, 0.9)), v(s.Alert, "successStandardBg", b(Z, s.success.light, 0.9)), v(s.Alert, "warningStandardBg", b(Z, s.warning.light, 0.9)), v(s.Alert, "errorIconColor", P("palette-error-main")), v(s.Alert, "infoIconColor", P("palette-info-main")), v(s.Alert, "successIconColor", P("palette-success-main")), v(s.Alert, "warningIconColor", P("palette-warning-main")), v(s.AppBar, "defaultBg", P("palette-grey-100")), v(s.Avatar, "defaultBg", P("palette-grey-400")), v(s.Button, "inheritContainedBg", P("palette-grey-300")), v(s.Button, "inheritContainedHoverBg", P("palette-grey-A100")), v(s.Chip, "defaultBorder", P("palette-grey-400")), v(s.Chip, "defaultAvatarColor", P("palette-grey-700")), v(s.Chip, "defaultIconColor", P("palette-grey-700")), v(s.FilledInput, "bg", "rgba(0, 0, 0, 0.06)"), v(s.FilledInput, "hoverBg", "rgba(0, 0, 0, 0.09)"), v(s.FilledInput, "disabledBg", "rgba(0, 0, 0, 0.12)"), v(s.LinearProgress, "primaryBg", b(Z, s.primary.main, 0.62)), v(s.LinearProgress, "secondaryBg", b(Z, s.secondary.main, 0.62)), v(s.LinearProgress, "errorBg", b(Z, s.error.main, 0.62)), v(s.LinearProgress, "infoBg", b(Z, s.info.main, 0.62)), v(s.LinearProgress, "successBg", b(Z, s.success.main, 0.62)), v(s.LinearProgress, "warningBg", b(Z, s.warning.main, 0.62)), v(s.Skeleton, "bg", g ? b(qe, s.text.primary, 0.11) : `rgba(${P("palette-text-primaryChannel")} / 0.11)`), v(s.Slider, "primaryTrack", b(Z, s.primary.main, 0.62)), v(s.Slider, "secondaryTrack", b(Z, s.secondary.main, 0.62)), v(s.Slider, "errorTrack", b(Z, s.error.main, 0.62)), v(s.Slider, "infoTrack", b(Z, s.info.main, 0.62)), v(s.Slider, "successTrack", b(Z, s.success.main, 0.62)), v(s.Slider, "warningTrack", b(Z, s.warning.main, 0.62));
      const B = g ? b(X, s.background.default, 0.6825) : Vt(s.background.default, 0.8);
      v(s.SnackbarContent, "bg", B), v(s.SnackbarContent, "color", De(() => g ? $r.text.primary : s.getContrastText(B))), v(s.SpeedDialAction, "fabHoverBg", Vt(s.background.paper, 0.15)), v(s.StepConnector, "border", P("palette-grey-400")), v(s.StepContent, "border", P("palette-grey-400")), v(s.Switch, "defaultColor", P("palette-common-white")), v(s.Switch, "defaultDisabledColor", P("palette-grey-100")), v(s.Switch, "primaryDisabledColor", b(Z, s.primary.main, 0.62)), v(s.Switch, "secondaryDisabledColor", b(Z, s.secondary.main, 0.62)), v(s.Switch, "errorDisabledColor", b(Z, s.error.main, 0.62)), v(s.Switch, "infoDisabledColor", b(Z, s.info.main, 0.62)), v(s.Switch, "successDisabledColor", b(Z, s.success.main, 0.62)), v(s.Switch, "warningDisabledColor", b(Z, s.warning.main, 0.62)), v(s.TableCell, "border", b(Z, b(qe, s.divider, 1), 0.88)), v(s.Tooltip, "bg", b(qe, s.grey[700], 0.92));
    }
    if (s.mode === "dark") {
      v(s.Alert, "errorColor", b(Z, s.error.light, 0.6)), v(s.Alert, "infoColor", b(Z, s.info.light, 0.6)), v(s.Alert, "successColor", b(Z, s.success.light, 0.6)), v(s.Alert, "warningColor", b(Z, s.warning.light, 0.6)), v(s.Alert, "errorFilledBg", P("palette-error-dark")), v(s.Alert, "infoFilledBg", P("palette-info-dark")), v(s.Alert, "successFilledBg", P("palette-success-dark")), v(s.Alert, "warningFilledBg", P("palette-warning-dark")), v(s.Alert, "errorFilledColor", De(() => s.getContrastText(s.error.dark))), v(s.Alert, "infoFilledColor", De(() => s.getContrastText(s.info.dark))), v(s.Alert, "successFilledColor", De(() => s.getContrastText(s.success.dark))), v(s.Alert, "warningFilledColor", De(() => s.getContrastText(s.warning.dark))), v(s.Alert, "errorStandardBg", b(X, s.error.light, 0.9)), v(s.Alert, "infoStandardBg", b(X, s.info.light, 0.9)), v(s.Alert, "successStandardBg", b(X, s.success.light, 0.9)), v(s.Alert, "warningStandardBg", b(X, s.warning.light, 0.9)), v(s.Alert, "errorIconColor", P("palette-error-main")), v(s.Alert, "infoIconColor", P("palette-info-main")), v(s.Alert, "successIconColor", P("palette-success-main")), v(s.Alert, "warningIconColor", P("palette-warning-main")), v(s.AppBar, "defaultBg", P("palette-grey-900")), v(s.AppBar, "darkBg", P("palette-background-paper")), v(s.AppBar, "darkColor", P("palette-text-primary")), v(s.Avatar, "defaultBg", P("palette-grey-600")), v(s.Button, "inheritContainedBg", P("palette-grey-800")), v(s.Button, "inheritContainedHoverBg", P("palette-grey-700")), v(s.Chip, "defaultBorder", P("palette-grey-700")), v(s.Chip, "defaultAvatarColor", P("palette-grey-300")), v(s.Chip, "defaultIconColor", P("palette-grey-300")), v(s.FilledInput, "bg", "rgba(255, 255, 255, 0.09)"), v(s.FilledInput, "hoverBg", "rgba(255, 255, 255, 0.13)"), v(s.FilledInput, "disabledBg", "rgba(255, 255, 255, 0.12)"), v(s.LinearProgress, "primaryBg", b(X, s.primary.main, 0.5)), v(s.LinearProgress, "secondaryBg", b(X, s.secondary.main, 0.5)), v(s.LinearProgress, "errorBg", b(X, s.error.main, 0.5)), v(s.LinearProgress, "infoBg", b(X, s.info.main, 0.5)), v(s.LinearProgress, "successBg", b(X, s.success.main, 0.5)), v(s.LinearProgress, "warningBg", b(X, s.warning.main, 0.5)), v(s.Skeleton, "bg", g ? b(qe, s.text.primary, 0.13) : `rgba(${P("palette-text-primaryChannel")} / 0.13)`), v(s.Slider, "primaryTrack", b(X, s.primary.main, 0.5)), v(s.Slider, "secondaryTrack", b(X, s.secondary.main, 0.5)), v(s.Slider, "errorTrack", b(X, s.error.main, 0.5)), v(s.Slider, "infoTrack", b(X, s.info.main, 0.5)), v(s.Slider, "successTrack", b(X, s.success.main, 0.5)), v(s.Slider, "warningTrack", b(X, s.warning.main, 0.5));
      const B = g ? b(Z, s.background.default, 0.985) : Vt(s.background.default, 0.98);
      v(s.SnackbarContent, "bg", B), v(s.SnackbarContent, "color", De(() => g ? Vn.text.primary : s.getContrastText(B))), v(s.SpeedDialAction, "fabHoverBg", Vt(s.background.paper, 0.15)), v(s.StepConnector, "border", P("palette-grey-600")), v(s.StepContent, "border", P("palette-grey-600")), v(s.Switch, "defaultColor", P("palette-grey-300")), v(s.Switch, "defaultDisabledColor", P("palette-grey-600")), v(s.Switch, "primaryDisabledColor", b(X, s.primary.main, 0.55)), v(s.Switch, "secondaryDisabledColor", b(X, s.secondary.main, 0.55)), v(s.Switch, "errorDisabledColor", b(X, s.error.main, 0.55)), v(s.Switch, "infoDisabledColor", b(X, s.info.main, 0.55)), v(s.Switch, "successDisabledColor", b(X, s.success.main, 0.55)), v(s.Switch, "warningDisabledColor", b(X, s.warning.main, 0.55)), v(s.TableCell, "border", b(X, b(qe, s.divider, 1), 0.68)), v(s.Tooltip, "bg", b(qe, s.grey[700], 0.92));
    }
    Me(s.background, "default"), Me(s.background, "paper"), Me(s.common, "background"), Me(s.common, "onBackground"), Me(s, "divider"), Object.keys(s).forEach((B) => {
      const L = s[B];
      B !== "tonalOffset" && L && typeof L == "object" && (L.main && v(s[B], "mainChannel", zt(Bt(L.main))), L.light && v(s[B], "lightChannel", zt(Bt(L.light))), L.dark && v(s[B], "darkChannel", zt(Bt(L.dark))), L.contrastText && v(s[B], "contrastTextChannel", zt(Bt(L.contrastText))), B === "text" && (Me(s[B], "primary"), Me(s[B], "secondary")), B === "action" && (L.active && Me(s[B], "active"), L.selected && Me(s[B], "selected")));
    });
  }), T = r.reduce((K, s) => ke(K, s), T);
  const V = {
    prefix: i,
    disableCssColorScheme: o,
    shouldSkipGeneratingVar: c,
    getSelector: Hi(T),
    enableContrastVars: l
  }, {
    vars: U,
    generateThemeVars: M,
    generateStyleSheets: de
  } = fi(T, V);
  return T.vars = U, Object.entries(T.colorSchemes[T.defaultColorScheme]).forEach(([K, s]) => {
    T[K] = s;
  }), T.generateThemeVars = M, T.generateStyleSheets = de, T.generateSpacing = function() {
    return On(m.spacing, zr(this));
  }, T.getColorSchemeSelector = pi(h), T.spacing = T.generateSpacing(), T.shouldSkipGeneratingVar = c, T.unstable_sxConfig = {
    ...lr,
    ...m == null ? void 0 : m.unstable_sxConfig
  }, T.unstable_sx = function(s) {
    return gt({
      sx: s,
      theme: this
    });
  }, T.toRuntimeSource = Gn, T;
}
function pn(e, r, n) {
  e.colorSchemes && n && (e.colorSchemes[r] = {
    ...n !== !0 && n,
    palette: Rr({
      ...n === !0 ? {} : n.palette,
      mode: r
    })
    // cast type to skip module augmentation test
  });
}
function Qi(e = {}, ...r) {
  const {
    palette: n,
    cssVariables: a = !1,
    colorSchemes: o = n ? void 0 : {
      light: !0
    },
    defaultColorScheme: i = n == null ? void 0 : n.mode,
    ...l
  } = e, c = i || "light", h = o == null ? void 0 : o[c], u = {
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
      return Ar(e, ...r);
    let m = n;
    "palette" in e || u[c] && (u[c] !== !0 ? m = u[c].palette : c === "dark" && (m = {
      mode: "dark"
    }));
    const p = Ar({
      ...e,
      palette: m
    }, ...r);
    return p.defaultColorScheme = c, p.colorSchemes = u, p.palette.mode === "light" && (p.colorSchemes.light = {
      ...u.light !== !0 && u.light,
      palette: p.palette
    }, pn(p, "dark", u.dark)), p.palette.mode === "dark" && (p.colorSchemes.dark = {
      ...u.dark !== !0 && u.dark,
      palette: p.palette
    }, pn(p, "light", u.light)), p;
  }
  return !n && !("light" in u) && c === "light" && (u.light = !0), Ji({
    ...l,
    colorSchemes: u,
    defaultColorScheme: c,
    ...typeof a != "boolean" && a
  }, ...r);
}
const Yi = Qi(), Xi = "$$material";
function Zi(e) {
  return e !== "ownerState" && e !== "theme" && e !== "sx" && e !== "as";
}
const es = (e) => Zi(e) && e !== "classes", ts = Xo({
  themeId: Xi,
  defaultTheme: Yi,
  rootShouldForwardProp: es
}), rs = di;
process.env.NODE_ENV !== "production" && (Y.node, Y.object.isRequired);
function ns(e) {
  return ci(e);
}
function as(e) {
  return Or("MuiSvgIcon", e);
}
Ko("MuiSvgIcon", ["root", "colorPrimary", "colorSecondary", "colorAction", "colorError", "colorDisabled", "fontSizeInherit", "fontSizeSmall", "fontSizeMedium", "fontSizeLarge"]);
const os = (e) => {
  const {
    color: r,
    fontSize: n,
    classes: a
  } = e, o = {
    root: ["root", r !== "inherit" && `color${tt(r)}`, `fontSize${tt(n)}`]
  };
  return Wa(o, as, a);
}, is = ts("svg", {
  name: "MuiSvgIcon",
  slot: "Root",
  overridesResolver: (e, r) => {
    const {
      ownerState: n
    } = e;
    return [r.root, n.color !== "inherit" && r[`color${tt(n.color)}`], r[`fontSize${tt(n.fontSize)}`]];
  }
})(rs(({
  theme: e
}) => {
  var r, n, a, o, i, l, c, h, u, m, p, C, S, y;
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
          fontSize: ((l = (i = e.typography) == null ? void 0 : i.pxToRem) == null ? void 0 : l.call(i, 20)) || "1.25rem"
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
          fontSize: ((m = (u = e.typography) == null ? void 0 : u.pxToRem) == null ? void 0 : m.call(u, 35)) || "2.1875rem"
        }
      },
      // TODO v5 deprecate color prop, v6 remove for sx
      ...Object.entries((e.vars ?? e).palette).filter(([, A]) => A && A.main).map(([A]) => {
        var E, R;
        return {
          props: {
            color: A
          },
          style: {
            color: (R = (E = (e.vars ?? e).palette) == null ? void 0 : E[A]) == null ? void 0 : R.main
          }
        };
      }),
      {
        props: {
          color: "action"
        },
        style: {
          color: (C = (p = (e.vars ?? e).palette) == null ? void 0 : p.action) == null ? void 0 : C.active
        }
      },
      {
        props: {
          color: "disabled"
        },
        style: {
          color: (y = (S = (e.vars ?? e).palette) == null ? void 0 : S.action) == null ? void 0 : y.disabled
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
})), Jt = /* @__PURE__ */ _e.forwardRef(function(r, n) {
  const a = ns({
    props: r,
    name: "MuiSvgIcon"
  }), {
    children: o,
    className: i,
    color: l = "inherit",
    component: c = "svg",
    fontSize: h = "medium",
    htmlColor: u,
    inheritViewBox: m = !1,
    titleAccess: p,
    viewBox: C = "0 0 24 24",
    ...S
  } = a, y = /* @__PURE__ */ _e.isValidElement(o) && o.type === "svg", A = {
    ...a,
    color: l,
    component: c,
    fontSize: h,
    instanceFontSize: r.fontSize,
    inheritViewBox: m,
    viewBox: C,
    hasSvgAsChild: y
  }, E = {};
  m || (E.viewBox = C);
  const R = os(A);
  return /* @__PURE__ */ d(is, {
    as: c,
    className: Nn(R.root, i),
    focusable: "false",
    color: u,
    "aria-hidden": p ? void 0 : !0,
    role: p ? "img" : void 0,
    ref: n,
    ...E,
    ...S,
    ...y && o.props,
    ownerState: A,
    children: [y ? o.props.children : o, p ? /* @__PURE__ */ t("title", {
      children: p
    }) : null]
  });
});
process.env.NODE_ENV !== "production" && (Jt.propTypes = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Node passed into the SVG element.
   */
  children: Y.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: Y.object,
  /**
   * @ignore
   */
  className: Y.string,
  /**
   * The color of the component.
   * It supports both default and custom theme colors, which can be added as shown in the
   * [palette customization guide](https://mui.com/material-ui/customization/palette/#custom-colors).
   * You can use the `htmlColor` prop to apply a color attribute to the SVG element.
   * @default 'inherit'
   */
  color: Y.oneOfType([Y.oneOf(["inherit", "action", "disabled", "primary", "secondary", "error", "info", "success", "warning"]), Y.string]),
  /**
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: Y.elementType,
  /**
   * The fontSize applied to the icon. Defaults to 24px, but can be configure to inherit font size.
   * @default 'medium'
   */
  fontSize: Y.oneOfType([Y.oneOf(["inherit", "large", "medium", "small"]), Y.string]),
  /**
   * Applies a color attribute to the SVG element.
   */
  htmlColor: Y.string,
  /**
   * If `true`, the root node will inherit the custom `component`'s viewBox and the `viewBox`
   * prop will be ignored.
   * Useful when you want to reference a custom `component` and have `SvgIcon` pass that
   * `component`'s viewBox to the root node.
   * @default false
   */
  inheritViewBox: Y.bool,
  /**
   * The shape-rendering attribute. The behavior of the different options is described on the
   * [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/shape-rendering).
   * If you are having issues with blurry icons you should investigate this prop.
   */
  shapeRendering: Y.string,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: Y.oneOfType([Y.arrayOf(Y.oneOfType([Y.func, Y.object, Y.bool])), Y.func, Y.object]),
  /**
   * Provides a human-readable title for the element that contains it.
   * https://www.w3.org/TR/SVG-access/#Equivalent
   */
  titleAccess: Y.string,
  /**
   * Allows you to redefine what the coordinates without units mean inside an SVG element.
   * For example, if the SVG element is 500 (width) by 200 (height),
   * and you pass viewBox="0 0 50 20",
   * this means that the coordinates inside the SVG will go from the top left corner (0,0)
   * to bottom right (50,20) and each unit will be worth 10px.
   * @default '0 0 24 24'
   */
  viewBox: Y.string
});
Jt.muiName = "SvgIcon";
function Q(e, r) {
  function n(a, o) {
    return /* @__PURE__ */ t(Jt, {
      "data-testid": process.env.NODE_ENV !== "production" ? `${r}Icon` : void 0,
      ref: o,
      ...a,
      children: e
    });
  }
  return process.env.NODE_ENV !== "production" && (n.displayName = `${r}Icon`), n.muiName = Jt.muiName, /* @__PURE__ */ _e.memo(/* @__PURE__ */ _e.forwardRef(n));
}
const Be = Q(/* @__PURE__ */ t("path", {
  d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8z"
}), "CheckCircle"), Te = Q(/* @__PURE__ */ t("path", {
  d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m1 15h-2v-2h2zm0-4h-2V7h2z"
}), "Error"), Lt = Q(/* @__PURE__ */ t("path", {
  d: "M1 21h22L12 2zm12-3h-2v-2h2zm0-4h-2v-4h2z"
}), "Warning");
async function ss(e) {
  const r = `${e}/api/client-manifest`, n = await fetch(r);
  if (!n.ok)
    throw new Error(
      `Failed to fetch client manifest: ${n.status} ${n.statusText}`
    );
  const a = await n.json(), o = {};
  for (const [i, l] of Object.entries(a.routes)) {
    const [c, h] = i.split(".");
    if (!c || !h) {
      console.warn(`Invalid route key: ${i}, skipping`);
      continue;
    }
    const u = c.replace(/-./g, (m) => m[1].toUpperCase());
    o[u] || (o[u] = {}), o[u][h] = ls(
      e,
      l.method,
      l.path
    );
  }
  return o;
}
function ls(e, r, n) {
  return async (a) => {
    const o = cs(e, n, a, r), i = {
      method: r,
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "same-origin"
      // Required for Basic Auth support
    };
    if (r !== "GET" && a)
      if (!n.includes(":"))
        i.body = JSON.stringify(a);
      else {
        const h = Tr(n), u = Object.keys(a).filter((m) => !h.includes(m)).reduce((m, p) => (m[p] = a[p], m), {});
        Object.keys(u).length > 0 && (i.body = JSON.stringify(u));
      }
    const l = await fetch(o, i);
    if (!l.ok)
      throw new Error(`API request failed: ${l.status} ${l.statusText}`);
    return l.json();
  };
}
function cs(e, r, n, a) {
  let o = r;
  if (n && r.includes(":")) {
    const i = Tr(r);
    for (const l of i)
      n[l] !== void 0 && (o = o.replace(`:${l}`, encodeURIComponent(n[l])));
  }
  if (a === "GET" && n) {
    const i = r.includes(":") ? Tr(r) : [], l = Object.keys(n).filter((c) => !i.includes(c)).reduce((c, h) => (c[h] = n[h], c), {});
    if (Object.keys(l).length > 0) {
      const c = new URLSearchParams();
      for (const [h, u] of Object.entries(l))
        u != null && c.append(h, String(u));
      o += `?${c.toString()}`;
    }
  }
  return `${e}${o}`;
}
function Tr(e) {
  const r = e.match(/:([a-zA-Z0-9_]+)/g);
  return r ? r.map((n) => n.slice(1)) : [];
}
class ds {
  constructor(r = "") {
    Ft(this, "baseUrl");
    Ft(this, "client", null);
    Ft(this, "clientPromise", null);
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
    this.clientPromise = ss(this.baseUrl);
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
      const i = await o.json().catch(() => ({}));
      throw new Error(i.error || i.message || `Request failed: ${o.statusText}`);
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
    const i = await this._fetch(`${this.baseUrl}/api/bans/email/${encodeURIComponent(r)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: n, duration: o })
    });
    if (!i.ok) {
      const l = await i.json().catch(() => ({}));
      throw new Error(l.error || `Ban request failed: ${i.statusText}`);
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
const G = new ds(), Jn = In(null);
function hs({ initialWidgets: e = [], children: r }) {
  const [n, a] = x(
    e.map((h) => ({ ...h, visible: h.visible !== !1, priority: h.priority ?? 100 }))
  ), o = ye((h) => {
    a((u) => u.some((p) => p.id === h.id) ? u.map((p) => p.id === h.id ? { ...h, visible: h.visible !== !1, priority: h.priority ?? 100 } : p) : [...u, { ...h, visible: h.visible !== !1, priority: h.priority ?? 100 }]);
  }, []), i = ye((h) => {
    a((u) => u.filter((m) => m.id !== h));
  }, []), l = ye((h, u) => {
    a((m) => m.map((p) => p.id === h ? { ...p, visible: u ?? !p.visible } : p));
  }, []), c = ye(() => n.filter((h) => h.visible !== !1).sort((h, u) => (h.priority ?? 100) - (u.priority ?? 100)), [n]);
  return /* @__PURE__ */ t(Jn.Provider, { value: { widgets: n, registerWidget: o, unregisterWidget: i, toggleWidget: l, getVisibleWidgets: c }, children: r });
}
function Qn() {
  const e = En(Jn);
  if (!e)
    throw new Error("useDashboardWidgets must be used within a DashboardWidgetProvider");
  return e;
}
function pl(e) {
  const { registerWidget: r, unregisterWidget: n } = Qn();
  return x(() => (r(e), null)), () => n(e.id);
}
function us() {
  const { getVisibleWidgets: e } = Qn(), r = e();
  return r.length === 0 ? null : /* @__PURE__ */ t(Ue, { children: r.map((n) => /* @__PURE__ */ d(f, { sx: { mt: 4 }, children: [
    n.title && /* @__PURE__ */ t(I, { variant: "h6", sx: { mb: 2, color: "var(--theme-text-primary)" }, children: n.title }),
    n.component
  ] }, n.id)) });
}
const Yn = In(null);
function ms({
  initialComponents: e = [],
  children: r
}) {
  const [n, a] = x(() => {
    const m = /* @__PURE__ */ new Map();
    for (const p of e)
      m.set(p.name, p.component);
    return m;
  }), o = ye((m, p) => {
    a((C) => {
      const S = new Map(C);
      return S.set(m, p), S;
    });
  }, []), i = ye((m) => {
    a((p) => {
      const C = new Map(p);
      for (const S of m)
        C.set(S.name, S.component);
      return C;
    });
  }, []), l = ye((m) => n.get(m) ?? null, [n]), c = ye((m) => n.has(m), [n]), h = ye(() => Array.from(n.keys()), [n]), u = ha(
    () => ({
      registerComponent: o,
      registerComponents: i,
      getComponent: l,
      hasComponent: c,
      getRegisteredNames: h
    }),
    [o, i, l, c, h]
  );
  return /* @__PURE__ */ t(Yn.Provider, { value: u, children: r });
}
function fs() {
  const e = En(Yn);
  if (!e)
    throw new Error("useWidgetComponentRegistry must be used within a WidgetComponentRegistryProvider");
  return e;
}
function ps({
  defaultOnly: e = !0,
  additionalWidgetIds: r = []
}) {
  const [n, a] = x([]), [o, i] = x(!0), [l, c] = x(null), { getComponent: h, hasComponent: u } = fs();
  if (re(() => {
    (async () => {
      try {
        const C = await G.getUiContributions();
        a(C.widgets || []), c(null);
      } catch (C) {
        c(C instanceof Error ? C.message : "Failed to fetch widgets");
      } finally {
        i(!1);
      }
    })();
  }, []), o)
    return /* @__PURE__ */ t(f, { sx: { display: "flex", justifyContent: "center", py: 4 }, children: /* @__PURE__ */ t(le, { size: 24 }) });
  if (l)
    return /* @__PURE__ */ t(ee, { severity: "error", sx: { mt: 2 }, children: l });
  const m = n.filter((p) => e ? p.showByDefault || r.includes(p.id) : !0).filter((p) => u(p.component) ? !0 : (console.warn(`Widget "${p.id}" references unregistered component "${p.component}"`), !1)).sort((p, C) => (p.priority ?? 100) - (C.priority ?? 100));
  return m.length === 0 ? null : /* @__PURE__ */ t(Ue, { children: m.map((p) => {
    const C = h(p.component);
    return /* @__PURE__ */ d(f, { sx: { mt: 4 }, children: [
      p.title && /* @__PURE__ */ t(I, { variant: "h6", sx: { mb: 2, color: "var(--theme-text-primary)" }, children: p.title }),
      C && /* @__PURE__ */ t(C, {})
    ] }, p.id);
  }) });
}
function gs(e) {
  switch (e) {
    case "healthy":
      return /* @__PURE__ */ t(Be, { sx: { fontSize: 24, color: "var(--theme-success)" } });
    case "degraded":
      return /* @__PURE__ */ t(Lt, { sx: { fontSize: 24, color: "var(--theme-warning)" } });
    case "unhealthy":
      return /* @__PURE__ */ t(Te, { sx: { fontSize: 24, color: "var(--theme-error)" } });
    default:
      return /* @__PURE__ */ t(Lt, { sx: { fontSize: 24, color: "var(--theme-text-secondary)" } });
  }
}
function gn(e) {
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
function ys(e) {
  return e <= 1 ? 1 : e === 2 ? 2 : e === 3 ? 3 : 4;
}
function bs() {
  const [e, r] = x(null), [n, a] = x(null);
  if (re(() => {
    const l = async () => {
      try {
        const h = await G.getHealth();
        r(h), a(null);
      } catch (h) {
        a(h instanceof Error ? h.message : "Failed to fetch health");
      }
    };
    l();
    const c = setInterval(l, 1e4);
    return () => clearInterval(c);
  }, []), n)
    return /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)", border: "1px solid var(--theme-error)" }, children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ t(j, { variant: "body2", customColor: "var(--theme-error)", content: n }) }) });
  const o = e ? Object.entries(e.checks) : [];
  if (o.length === 0)
    return /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ t(j, { variant: "body2", customColor: "var(--theme-text-secondary)", content: "No health checks configured" }) }) });
  const i = ys(o.length);
  return /* @__PURE__ */ t(Xt, { columns: i, spacing: "medium", equalHeight: !0, children: o.map(([l, c]) => /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ d(f, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
    gs(c.status),
    /* @__PURE__ */ d(f, { sx: { flex: 1, minWidth: 0 }, children: [
      /* @__PURE__ */ t(
        j,
        {
          variant: "body1",
          fontWeight: "500",
          content: l.charAt(0).toUpperCase() + l.slice(1),
          customColor: "var(--theme-text-primary)"
        }
      ),
      /* @__PURE__ */ d(f, { sx: { display: "flex", alignItems: "center", gap: 1, mt: 0.5 }, children: [
        /* @__PURE__ */ t(
          te,
          {
            label: c.status,
            size: "small",
            sx: {
              bgcolor: gn(c.status) + "20",
              color: gn(c.status),
              fontSize: "0.75rem",
              height: 20
            }
          }
        ),
        c.latency !== void 0 && /* @__PURE__ */ t(
          j,
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
function vs() {
  const [e, r] = x(null), [n, a] = x(!0), [o, i] = x(null);
  if (re(() => {
    (async () => {
      try {
        const u = await G.fetch("/ai-proxy/config");
        r(u);
      } catch (u) {
        i(u instanceof Error ? u.message : "Failed to fetch integrations");
      } finally {
        a(!1);
      }
    })();
  }, []), n)
    return /* @__PURE__ */ t(f, { sx: { display: "flex", justifyContent: "center", py: 2 }, children: /* @__PURE__ */ t(le, { size: 20 }) });
  if (o)
    return /* @__PURE__ */ t(ee, { severity: "warning", sx: { py: 0.5, fontSize: 13 }, children: "Unable to load integrations" });
  if (!e) return null;
  const l = e.integrations.filter((h) => h.configured).length, c = e.integrations.length;
  return /* @__PURE__ */ d(
    f,
    {
      sx: {
        bgcolor: "var(--theme-surface)",
        borderRadius: 2,
        p: 2,
        border: "1px solid var(--theme-border)"
      },
      children: [
        /* @__PURE__ */ d(f, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }, children: [
          /* @__PURE__ */ d(I, { variant: "subtitle2", sx: { color: "var(--theme-text-secondary)" }, children: [
            l,
            " of ",
            c,
            " configured"
          ] }),
          /* @__PURE__ */ d(I, { variant: "subtitle2", sx: { color: "var(--theme-text-secondary)" }, children: [
            e.stats.totalRequests,
            " requests"
          ] })
        ] }),
        /* @__PURE__ */ t(f, { sx: { display: "flex", flexDirection: "column", gap: 1.5 }, children: e.integrations.map((h) => /* @__PURE__ */ d(
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
              /* @__PURE__ */ d(f, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                h.configured ? /* @__PURE__ */ t(Be, { sx: { color: "var(--theme-success)", fontSize: 18 } }) : /* @__PURE__ */ t(Te, { sx: { color: "var(--theme-text-secondary)", fontSize: 18 } }),
                /* @__PURE__ */ d(f, { children: [
                  /* @__PURE__ */ t(I, { variant: "body2", sx: { color: "var(--theme-text-primary)", fontWeight: 500 }, children: h.name }),
                  /* @__PURE__ */ t(I, { variant: "caption", sx: { color: "var(--theme-text-secondary)" }, children: h.description })
                ] })
              ] }),
              /* @__PURE__ */ t(
                te,
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
const Lr = Q(/* @__PURE__ */ t("path", {
  d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2M4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12m8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8"
}), "Block"), xs = {
  supertokens: "SuperTokens",
  auth0: "Auth0",
  supabase: "Supabase",
  basic: "Basic Auth"
};
function Cs() {
  const [e, r] = x(null), [n, a] = x(!0), [o, i] = x(null);
  if (re(() => {
    (async () => {
      try {
        const u = await G.fetch("/auth/config/status");
        r(u);
      } catch (u) {
        i(u instanceof Error ? u.message : "Failed to fetch auth status");
      } finally {
        a(!1);
      }
    })();
  }, []), n)
    return /* @__PURE__ */ t(f, { sx: { display: "flex", justifyContent: "center", py: 2 }, children: /* @__PURE__ */ t(le, { size: 20 }) });
  if (o)
    return /* @__PURE__ */ t(ee, { severity: "warning", sx: { py: 0.5, fontSize: 13 }, children: "Unable to load auth status" });
  if (!e) return null;
  const l = () => {
    switch (e.state) {
      case "enabled":
        return /* @__PURE__ */ t(Be, { sx: { color: "var(--theme-success)", fontSize: 32 } });
      case "error":
        return /* @__PURE__ */ t(Te, { sx: { color: "var(--theme-error)", fontSize: 32 } });
      case "disabled":
      default:
        return /* @__PURE__ */ t(Lr, { sx: { color: "var(--theme-text-secondary)", fontSize: 32 } });
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
  return /* @__PURE__ */ d(
    f,
    {
      sx: {
        bgcolor: "var(--theme-surface)",
        borderRadius: 2,
        p: 2,
        border: "1px solid var(--theme-border)"
      },
      children: [
        /* @__PURE__ */ d(f, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
          l(),
          /* @__PURE__ */ d(f, { sx: { flex: 1 }, children: [
            /* @__PURE__ */ d(f, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 0.5 }, children: [
              /* @__PURE__ */ t(I, { variant: "subtitle1", sx: { color: "var(--theme-text-primary)", fontWeight: 600 }, children: e.state === "enabled" && e.adapter ? xs[e.adapter] || e.adapter : e.state === "disabled" ? "Not Configured" : "Configuration Error" }),
              /* @__PURE__ */ t(
                te,
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
            /* @__PURE__ */ t(I, { variant: "body2", sx: { color: "var(--theme-text-secondary)" }, children: e.state === "enabled" ? "Authentication is active" : e.state === "disabled" ? "Set AUTH_ADAPTER environment variable" : e.error || "Check configuration" })
          ] })
        ] }),
        e.missingVars && e.missingVars.length > 0 && /* @__PURE__ */ d(ee, { severity: "warning", sx: { mt: 2, py: 0.5, "& .MuiAlert-message": { fontSize: 12 } }, children: [
          "Missing: ",
          e.missingVars.join(", ")
        ] })
      ]
    }
  );
}
const ws = Q(/* @__PURE__ */ t("path", {
  d: "m1 9 2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9m8 8 3 3 3-3c-1.65-1.66-4.34-1.66-6 0m-4-4 2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13"
}), "Wifi"), yn = Q(/* @__PURE__ */ t("path", {
  d: "M22.99 9C19.15 5.16 13.8 3.76 8.84 4.78l2.52 2.52c3.47-.17 6.99 1.05 9.63 3.7zm-4 4c-1.29-1.29-2.84-2.13-4.49-2.56l3.53 3.53zM2 3.05 5.07 6.1C3.6 6.82 2.22 7.78 1 9l1.99 2c1.24-1.24 2.67-2.16 4.2-2.77l2.24 2.24C7.81 10.89 6.27 11.73 5 13v.01L6.99 15c1.36-1.36 3.14-2.04 4.92-2.06L18.98 20l1.27-1.26L3.29 1.79zM9 17l3 3 3-3c-1.65-1.66-4.34-1.66-6 0"
}), "WifiOff"), Ss = Q(/* @__PURE__ */ t("path", {
  d: "M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1m-1 9h-4v-7h4z"
}), "Devices"), Xn = Q(/* @__PURE__ */ t("path", {
  d: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4"
}), "Person"), ks = Q(/* @__PURE__ */ t("path", {
  d: "M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"
}), "Send");
function br(e) {
  return e >= 1e6 ? `${(e / 1e6).toFixed(1)}M` : e >= 1e3 ? `${(e / 1e3).toFixed(1)}K` : e.toString();
}
function Is(e) {
  return e < 1e3 ? `${e}ms` : e < 6e4 ? `${(e / 1e3).toFixed(0)}s` : e < 36e5 ? `${(e / 6e4).toFixed(0)}m` : `${(e / 36e5).toFixed(1)}h`;
}
function Es() {
  const [e, r] = x(null), [n, a] = x(null), [o, i] = x(!0);
  if (re(() => {
    const h = async () => {
      try {
        const m = await G.getNotificationsStats();
        r(m), a(null);
      } catch (m) {
        m instanceof Error && m.message.includes("404") ? a("Notifications plugin not enabled") : a(m instanceof Error ? m.message : "Failed to fetch stats");
      } finally {
        i(!1);
      }
    };
    h();
    const u = setInterval(h, 5e3);
    return () => clearInterval(u);
  }, []), o)
    return /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ t(Yt, {}) }) });
  if (n)
    return /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)", border: "1px solid var(--theme-border)" }, children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ d(f, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
      /* @__PURE__ */ t(yn, { sx: { color: "var(--theme-text-secondary)" } }),
      /* @__PURE__ */ t(j, { variant: "body2", customColor: "var(--theme-text-secondary)", content: n })
    ] }) }) });
  if (!e)
    return null;
  const l = e.connectionHealth.isHealthy, c = l ? "var(--theme-success)" : "var(--theme-warning)";
  return /* @__PURE__ */ d(f, { children: [
    /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)", mb: 2 }, children: /* @__PURE__ */ t(W, { sx: { py: 1, "&:last-child": { pb: 1 } }, children: /* @__PURE__ */ d(f, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
      /* @__PURE__ */ d(f, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
        l ? /* @__PURE__ */ t(ws, { sx: { color: c, fontSize: 20 } }) : /* @__PURE__ */ t(yn, { sx: { color: c, fontSize: 20 } }),
        /* @__PURE__ */ t(
          j,
          {
            variant: "body2",
            content: l ? "Connected" : "Reconnecting...",
            customColor: c,
            fontWeight: "500"
          }
        ),
        e.connectionHealth.isReconnecting && /* @__PURE__ */ t(
          te,
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
      /* @__PURE__ */ d(f, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        /* @__PURE__ */ t(
          j,
          {
            variant: "caption",
            content: `${e.channels.length} channel${e.channels.length !== 1 ? "s" : ""}`,
            customColor: "var(--theme-text-secondary)"
          }
        ),
        e.lastEventAt && /* @__PURE__ */ t(
          j,
          {
            variant: "caption",
            content: `Last event: ${Is(e.connectionHealth.timeSinceLastEvent)} ago`,
            customColor: "var(--theme-text-secondary)"
          }
        )
      ] })
    ] }) }) }),
    /* @__PURE__ */ d(Xt, { columns: 4, spacing: "small", equalHeight: !0, children: [
      /* @__PURE__ */ t(
        Dt,
        {
          icon: /* @__PURE__ */ t(Ss, { sx: { fontSize: 28 } }),
          label: "Active Clients",
          value: e.currentConnections,
          subValue: `${e.totalConnections} total`,
          color: "var(--theme-primary)"
        }
      ),
      /* @__PURE__ */ t(
        Dt,
        {
          icon: /* @__PURE__ */ t(Xn, { sx: { fontSize: 28 } }),
          label: "By Device",
          value: e.clientsByType.device,
          subValue: `${e.clientsByType.user} by user`,
          color: "var(--theme-info)"
        }
      ),
      /* @__PURE__ */ t(
        Dt,
        {
          icon: /* @__PURE__ */ t(ks, { sx: { fontSize: 28 } }),
          label: "Events Routed",
          value: br(e.eventsRouted),
          subValue: `${br(e.eventsProcessed)} processed`,
          color: "var(--theme-success)"
        }
      ),
      /* @__PURE__ */ t(
        Dt,
        {
          icon: /* @__PURE__ */ t(Te, { sx: { fontSize: 28 } }),
          label: "Dropped",
          value: br(e.eventsDroppedNoClients),
          subValue: `${e.eventsParseFailed} parse errors`,
          color: e.eventsDroppedNoClients > 0 ? "var(--theme-warning)" : "var(--theme-text-secondary)"
        }
      )
    ] })
  ] });
}
const $s = Q(/* @__PURE__ */ t("path", {
  d: "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1M8 13h8v-2H8zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5"
}), "Link");
function As() {
  const [e, r] = x(null), [n, a] = x(!0), [o, i] = x(null), l = async () => {
    try {
      const p = await (await fetch("/api/cms/status")).json();
      r(p), i(null);
    } catch (m) {
      i(m instanceof Error ? m.message : "Failed to fetch CMS status");
    } finally {
      a(!1);
    }
  };
  if (re(() => {
    l();
    const m = setInterval(l, 3e4);
    return () => clearInterval(m);
  }, []), n)
    return /* @__PURE__ */ t(_, { children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ t(f, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100px", children: /* @__PURE__ */ t(le, { size: 24 }) }) }) });
  if (o || !e)
    return /* @__PURE__ */ t(_, { children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ t(ee, { severity: "error", children: o || "Failed to load CMS status" }) }) });
  const c = e.status === "running", h = c ? "success" : e.status === "unhealthy" ? "warning" : "error", u = c ? Be : Te;
  return /* @__PURE__ */ t(_, { children: /* @__PURE__ */ d(W, { children: [
    /* @__PURE__ */ d(f, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, children: [
      /* @__PURE__ */ t(I, { variant: "h6", children: "Payload CMS" }),
      /* @__PURE__ */ t(
        te,
        {
          label: e.status.toUpperCase(),
          color: h,
          size: "small",
          icon: /* @__PURE__ */ t(u, {})
        }
      )
    ] }),
    /* @__PURE__ */ d(f, { display: "flex", flexDirection: "column", gap: 1, children: [
      /* @__PURE__ */ d(f, { display: "flex", alignItems: "center", gap: 1, children: [
        /* @__PURE__ */ t($s, { fontSize: "small", color: "action" }),
        /* @__PURE__ */ t(I, { variant: "body2", color: "text.secondary", children: e.url })
      ] }),
      e.error && /* @__PURE__ */ t(ee, { severity: "error", sx: { mt: 1 }, children: e.error }),
      /* @__PURE__ */ d(I, { variant: "caption", color: "text.secondary", sx: { mt: 1 }, children: [
        "Last checked: ",
        new Date(e.timestamp).toLocaleTimeString()
      ] })
    ] })
  ] }) });
}
const jt = Q(/* @__PURE__ */ t("path", {
  d: "M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z"
}), "Refresh"), Qt = Q(/* @__PURE__ */ t("path", {
  d: "M8 5v14l11-7z"
}), "PlayArrow");
function Ts() {
  const [e, r] = x(null), [n, a] = x([]), [o, i] = x(!0), [l, c] = x(null), [h, u] = x(null), [m, p] = x(null), C = async () => {
    try {
      const g = await (await fetch("/api/cms/status")).json();
      r(g);
    } catch ($) {
      console.error("Failed to fetch CMS status:", $);
    }
  }, S = async () => {
    try {
      const g = await (await fetch("/api/cms/seeds")).json();
      a(g.seeds || []);
    } catch ($) {
      console.error("Failed to fetch seeds:", $);
    } finally {
      i(!1);
    }
  };
  re(() => {
    C(), S();
    const $ = setInterval(C, 3e4);
    return () => clearInterval($);
  }, []);
  const y = async () => {
    u(null), p(null);
    try {
      const $ = await fetch("/api/cms/restart", { method: "POST" }), g = await $.json();
      $.ok ? (p("CMS service restarted successfully"), setTimeout(() => C(), 2e3)) : u(g.message || "Restart not implemented");
    } catch ($) {
      u($ instanceof Error ? $.message : "Failed to restart CMS");
    }
  }, A = async ($) => {
    c($), u(null), p(null);
    try {
      const z = await (await fetch(`/api/cms/seeds/${$}/execute`, {
        method: "POST"
      })).json();
      z.success ? p(`Seed "${$}" executed successfully`) : u(z.error || "Seed execution failed");
    } catch (g) {
      u(g instanceof Error ? g.message : "Failed to execute seed");
    } finally {
      c(null);
    }
  };
  if (o)
    return /* @__PURE__ */ t(_, { children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ t(f, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px", children: /* @__PURE__ */ t(le, {}) }) }) });
  const E = (e == null ? void 0 : e.status) === "running", R = E ? "success" : (e == null ? void 0 : e.status) === "unhealthy" ? "warning" : "error", O = E ? Be : Te;
  return /* @__PURE__ */ t(_, { children: /* @__PURE__ */ d(W, { children: [
    /* @__PURE__ */ d(f, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, children: [
      /* @__PURE__ */ t(I, { variant: "h6", children: "CMS Service Control" }),
      e && /* @__PURE__ */ t(
        te,
        {
          label: e.status.toUpperCase(),
          color: R,
          size: "small",
          icon: /* @__PURE__ */ t(O, {})
        }
      )
    ] }),
    h && /* @__PURE__ */ t(ee, { severity: "error", sx: { mb: 2 }, onClose: () => u(null), children: h }),
    m && /* @__PURE__ */ t(ee, { severity: "success", sx: { mb: 2 }, onClose: () => p(null), children: m }),
    /* @__PURE__ */ d(f, { mb: 3, children: [
      /* @__PURE__ */ t(I, { variant: "subtitle2", gutterBottom: !0, children: "Service Control" }),
      /* @__PURE__ */ t(I, { variant: "body2", color: "text.secondary", mb: 2, children: "Manage the Payload CMS service" }),
      /* @__PURE__ */ t(
        ze,
        {
          variant: "outlined",
          startIcon: /* @__PURE__ */ t(jt, {}),
          onClick: y,
          disabled: !e,
          children: "Restart CMS Service"
        }
      )
    ] }),
    /* @__PURE__ */ t(An, { sx: { my: 2 } }),
    /* @__PURE__ */ d(f, { children: [
      /* @__PURE__ */ d(f, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, children: [
        /* @__PURE__ */ t(I, { variant: "subtitle2", children: "Seed Scripts" }),
        /* @__PURE__ */ t($e, { size: "small", onClick: S, children: /* @__PURE__ */ t(jt, { fontSize: "small" }) })
      ] }),
      /* @__PURE__ */ t(I, { variant: "body2", color: "text.secondary", mb: 2, children: "Execute database seed scripts for initial data setup" }),
      n.length > 0 ? /* @__PURE__ */ t(fa, { dense: !0, children: n.map(($) => /* @__PURE__ */ t(
        pa,
        {
          secondaryAction: /* @__PURE__ */ t(
            ze,
            {
              variant: "outlined",
              size: "small",
              startIcon: l === $.name ? /* @__PURE__ */ t(le, { size: 16 }) : /* @__PURE__ */ t(Qt, {}),
              onClick: () => A($.name),
              disabled: l !== null,
              children: l === $.name ? "Running..." : "Run"
            }
          ),
          children: /* @__PURE__ */ t(
            ga,
            {
              primary: $.name,
              secondary: $.file
            }
          )
        },
        $.name
      )) }) : /* @__PURE__ */ t(ee, { severity: "info", children: "No seed scripts found. Place seed scripts in the configured seeds directory." })
    ] })
  ] }) });
}
const vr = 1e5, Pr = 10;
function Nr(e, r = 0) {
  return r > Pr ? !0 : e && typeof e == "object" && !Array.isArray(e) ? Object.values(e).some((n) => Nr(n, r + 1)) : Array.isArray(e) ? e.some((n) => Nr(n, r + 1)) : !1;
}
function Ps() {
  const [e, r] = x("{}"), [n, a] = x(!0), [o, i] = x(!1), [l, c] = x(null), [h, u] = x(!1), [m, p] = x(null), [C, S] = x(!1);
  re(() => {
    (async () => {
      try {
        const z = await G.getPreferences();
        r(JSON.stringify(z.preferences, null, 2)), c(null);
      } catch (z) {
        c(z instanceof Error ? z.message : "Failed to load preferences");
      } finally {
        a(!1);
      }
    })();
  }, []);
  const y = (g) => {
    r(g), S(!0), u(!1);
    try {
      const z = JSON.parse(g);
      if (Nr(z)) {
        p(`Preferences object too deeply nested (max ${Pr} levels)`);
        return;
      }
      p(null);
    } catch (z) {
      p(z instanceof Error ? z.message : "Invalid JSON");
    }
  }, A = async () => {
    if (!m)
      try {
        const g = JSON.parse(e);
        i(!0), c(null);
        const z = await G.updatePreferences(g);
        r(JSON.stringify(z.preferences, null, 2)), u(!0), S(!1);
      } catch (g) {
        c(g instanceof Error ? g.message : "Failed to save preferences");
      } finally {
        i(!1);
      }
  }, E = async () => {
    if (confirm("Reset all preferences to defaults? This cannot be undone."))
      try {
        i(!0), c(null), await G.deletePreferences();
        const g = await G.getPreferences();
        r(JSON.stringify(g.preferences, null, 2)), u(!0), S(!1);
      } catch (g) {
        c(g instanceof Error ? g.message : "Failed to reset preferences");
      } finally {
        i(!1);
      }
  }, R = () => {
    try {
      const g = JSON.parse(e);
      r(JSON.stringify(g, null, 2)), p(null);
    } catch {
    }
  };
  if (n)
    return /* @__PURE__ */ t(f, { sx: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }, children: /* @__PURE__ */ t(le, {}) });
  const O = e.length, $ = O / vr * 100;
  return /* @__PURE__ */ d(f, { children: [
    /* @__PURE__ */ d(f, { sx: { mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
      /* @__PURE__ */ d(f, { children: [
        /* @__PURE__ */ t(I, { variant: "h4", sx: { color: "var(--theme-text-primary)" }, children: "Preferences" }),
        /* @__PURE__ */ t(I, { variant: "body2", sx: { color: "var(--theme-text-secondary)", mt: 0.5 }, children: "Manage your user preferences as JSON" })
      ] }),
      /* @__PURE__ */ t(f, { sx: { display: "flex", gap: 1 }, children: /* @__PURE__ */ t(
        te,
        {
          label: `${O.toLocaleString()} / ${vr.toLocaleString()} bytes`,
          size: "small",
          color: $ > 90 ? "error" : $ > 75 ? "warning" : "default"
        }
      ) })
    ] }),
    l && /* @__PURE__ */ t(ee, { severity: "error", sx: { mb: 2 }, onClose: () => c(null), children: l }),
    h && /* @__PURE__ */ t(ee, { severity: "success", sx: { mb: 2 }, onClose: () => u(!1), children: "Preferences saved successfully" }),
    /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)", mb: 2 }, children: /* @__PURE__ */ d(W, { children: [
      /* @__PURE__ */ d(f, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }, children: [
        /* @__PURE__ */ t(I, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: "Preferences JSON" }),
        /* @__PURE__ */ t(
          oe,
          {
            variant: "outlined",
            onClick: R,
            disabled: !!m,
            children: "Format JSON"
          }
        )
      ] }),
      /* @__PURE__ */ t(
        F,
        {
          fullWidth: !0,
          multiline: !0,
          rows: 20,
          value: e,
          onChange: (g) => y(g.target.value),
          error: !!m,
          helperText: m || `Edit your preferences as JSON. Max ${vr.toLocaleString()} bytes, max ${Pr} levels deep.`,
          sx: {
            "& .MuiInputBase-root": {
              fontFamily: "monospace",
              fontSize: "0.875rem"
            }
          }
        }
      )
    ] }) }),
    /* @__PURE__ */ d(f, { sx: { display: "flex", gap: 2, justifyContent: "flex-end" }, children: [
      /* @__PURE__ */ t(
        oe,
        {
          variant: "outlined",
          onClick: E,
          disabled: o,
          color: "error",
          children: "Reset to Defaults"
        }
      ),
      /* @__PURE__ */ t(
        oe,
        {
          variant: "contained",
          onClick: A,
          disabled: !!m || !C || o,
          loading: o,
          children: "Save Preferences"
        }
      )
    ] })
  ] });
}
function Ns() {
  return [
    { name: "ServiceHealthWidget", component: bs },
    { name: "IntegrationStatusWidget", component: vs },
    { name: "AuthStatusWidget", component: Cs },
    { name: "NotificationsStatsWidget", component: Es },
    { name: "CMSStatusWidget", component: As },
    { name: "CMSMaintenanceWidget", component: Ts },
    { name: "PreferencesPage", component: Ps }
  ];
}
function Ds(e) {
  switch (e) {
    case "healthy":
      return /* @__PURE__ */ t(Be, { sx: { color: "var(--theme-success)" } });
    case "degraded":
      return /* @__PURE__ */ t(Lt, { sx: { color: "var(--theme-warning)" } });
    case "unhealthy":
      return /* @__PURE__ */ t(Te, { sx: { color: "var(--theme-error)" } });
    default:
      return /* @__PURE__ */ t(le, { size: 20 });
  }
}
function xr(e) {
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
function zs() {
  var C, S;
  const e = $n(), [r, n] = x(null), [a, o] = x(null), [i, l] = x(!0), [c, h] = x(null);
  if (re(() => {
    const y = async () => {
      try {
        const [E, R] = await Promise.all([
          G.getHealth(),
          G.getInfo()
        ]);
        n(E), o(R), h(null);
      } catch (E) {
        h(E instanceof Error ? E.message : "Failed to fetch data");
      } finally {
        l(!1);
      }
    };
    y();
    const A = setInterval(y, 1e4);
    return () => clearInterval(A);
  }, []), i)
    return /* @__PURE__ */ t(f, { sx: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }, children: /* @__PURE__ */ t(le, {}) });
  if (c)
    return /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)", border: "1px solid var(--theme-error)" }, children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ t(I, { color: "error", children: c }) }) });
  const u = r ? Object.entries(r.checks) : [], m = u.filter(([, y]) => y.status === "healthy").length, p = u.length;
  return /* @__PURE__ */ d(f, { children: [
    /* @__PURE__ */ t(I, { variant: "h4", sx: { mb: 1, color: "var(--theme-text-primary)" }, children: "Dashboard" }),
    /* @__PURE__ */ d(I, { variant: "body2", sx: { mb: 4, color: "var(--theme-text-secondary)" }, children: [
      "Real-time overview of ",
      (a == null ? void 0 : a.product) || "your service"
    ] }),
    /* @__PURE__ */ t(
      _,
      {
        sx: {
          mb: 4,
          bgcolor: "var(--theme-surface)",
          border: `2px solid ${xr((r == null ? void 0 : r.status) || "unknown")}`
        },
        children: /* @__PURE__ */ t(ya, { onClick: () => e("/health"), children: /* @__PURE__ */ d(W, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
          /* @__PURE__ */ d(f, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
            Ds((r == null ? void 0 : r.status) || "unknown"),
            /* @__PURE__ */ d(f, { children: [
              /* @__PURE__ */ d(I, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: [
                "Service Status: ",
                (C = r == null ? void 0 : r.status) == null ? void 0 : C.charAt(0).toUpperCase(),
                (S = r == null ? void 0 : r.status) == null ? void 0 : S.slice(1)
              ] }),
              /* @__PURE__ */ t(I, { variant: "body2", sx: { color: "var(--theme-text-secondary)" }, children: "Click to view detailed health information" })
            ] })
          ] }),
          /* @__PURE__ */ t(
            te,
            {
              label: `${m}/${p} checks passing`,
              sx: {
                bgcolor: xr((r == null ? void 0 : r.status) || "unknown") + "20",
                color: xr((r == null ? void 0 : r.status) || "unknown")
              }
            }
          )
        ] }) })
      }
    ),
    /* @__PURE__ */ t(ps, {}),
    /* @__PURE__ */ t(us, {})
  ] });
}
const jr = Q(/* @__PURE__ */ t("path", {
  d: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14"
}), "Search"), Bs = Q(/* @__PURE__ */ t("path", {
  d: "M6 19h4V5H6zm8-14v14h4V5z"
}), "Pause"), Os = Q(/* @__PURE__ */ t("path", {
  d: "m4 12 1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8z"
}), "ArrowUpward"), Ms = Q(/* @__PURE__ */ t("path", {
  d: "m20 12-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8z"
}), "ArrowDownward"), Rs = Q(/* @__PURE__ */ t("path", {
  d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m1 15h-2v-6h2zm0-8h-2V7h2z"
}), "Info"), Ls = Q(/* @__PURE__ */ t("path", {
  d: "M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5s-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20zm-6 8h-4v-2h4zm0-4h-4v-2h4z"
}), "BugReport");
function bn(e) {
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
function js() {
  const [e, r] = x([]), [n, a] = x([]), [o, i] = x(!0), [l, c] = x(null), [h, u] = x(""), [m, p] = x(""), [C, S] = x(""), [y, A] = x(1), [E, R] = x(0), O = 50, [$, g] = x(!1), [z, T] = x("desc"), V = ua(null), U = {
    total: E,
    errors: e.filter((b) => b.level.toLowerCase() === "error").length,
    warnings: e.filter((b) => ["warn", "warning"].includes(b.level.toLowerCase())).length,
    info: e.filter((b) => b.level.toLowerCase() === "info").length,
    debug: e.filter((b) => b.level.toLowerCase() === "debug").length
  }, M = ye(async () => {
    i(!0);
    try {
      const b = await G.getLogs({
        source: h || void 0,
        level: m || void 0,
        search: C || void 0,
        limit: O,
        page: y
      }), B = [...b.logs].sort((L, ne) => {
        const H = new Date(L.timestamp).getTime(), fe = new Date(ne.timestamp).getTime();
        return z === "desc" ? fe - H : H - fe;
      });
      r(B), R(b.total), c(null);
    } catch (b) {
      c(b instanceof Error ? b.message : "Failed to fetch logs");
    } finally {
      i(!1);
    }
  }, [h, m, C, y, z]), de = async () => {
    try {
      const b = await G.getLogSources();
      a(b);
    } catch {
    }
  };
  re(() => {
    de();
  }, []), re(() => {
    M();
  }, [M]), re(() => ($ ? V.current = setInterval(M, 5e3) : V.current && (clearInterval(V.current), V.current = null), () => {
    V.current && clearInterval(V.current);
  }), [$, M]);
  const K = () => {
    A(1), M();
  }, s = (b, B) => {
    B !== null && T(B);
  }, P = Math.ceil(E / O);
  return /* @__PURE__ */ d(f, { children: [
    /* @__PURE__ */ t(I, { variant: "h4", sx: { mb: 1, color: "var(--theme-text-primary)" }, children: "Logs" }),
    /* @__PURE__ */ t(I, { variant: "body2", sx: { mb: 4, color: "var(--theme-text-secondary)" }, children: "View and search application logs" }),
    /* @__PURE__ */ d(Ce, { container: !0, spacing: 2, sx: { mb: 3 }, children: [
      /* @__PURE__ */ t(Ce, { size: { xs: 6, sm: 3, md: 2.4 }, children: /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ d(W, { sx: { py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }, children: [
        /* @__PURE__ */ t(f, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: /* @__PURE__ */ t(I, { variant: "h5", sx: { color: "var(--theme-text-primary)", fontWeight: 600 }, children: U.total.toLocaleString() }) }),
        /* @__PURE__ */ t(I, { variant: "caption", sx: { color: "var(--theme-text-secondary)" }, children: "Total Logs" })
      ] }) }) }),
      /* @__PURE__ */ t(Ce, { size: { xs: 6, sm: 3, md: 2.4 }, children: /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ d(W, { sx: { py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }, children: [
        /* @__PURE__ */ d(f, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
          /* @__PURE__ */ t(Te, { sx: { color: "var(--theme-error)", fontSize: 20 } }),
          /* @__PURE__ */ t(I, { variant: "h5", sx: { color: "var(--theme-error)", fontWeight: 600 }, children: U.errors })
        ] }),
        /* @__PURE__ */ t(I, { variant: "caption", sx: { color: "var(--theme-text-secondary)" }, children: "Errors" })
      ] }) }) }),
      /* @__PURE__ */ t(Ce, { size: { xs: 6, sm: 3, md: 2.4 }, children: /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ d(W, { sx: { py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }, children: [
        /* @__PURE__ */ d(f, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
          /* @__PURE__ */ t(Lt, { sx: { color: "var(--theme-warning)", fontSize: 20 } }),
          /* @__PURE__ */ t(I, { variant: "h5", sx: { color: "var(--theme-warning)", fontWeight: 600 }, children: U.warnings })
        ] }),
        /* @__PURE__ */ t(I, { variant: "caption", sx: { color: "var(--theme-text-secondary)" }, children: "Warnings" })
      ] }) }) }),
      /* @__PURE__ */ t(Ce, { size: { xs: 6, sm: 3, md: 2.4 }, children: /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ d(W, { sx: { py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }, children: [
        /* @__PURE__ */ d(f, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
          /* @__PURE__ */ t(Rs, { sx: { color: "var(--theme-info)", fontSize: 20 } }),
          /* @__PURE__ */ t(I, { variant: "h5", sx: { color: "var(--theme-info)", fontWeight: 600 }, children: U.info })
        ] }),
        /* @__PURE__ */ t(I, { variant: "caption", sx: { color: "var(--theme-text-secondary)" }, children: "Info" })
      ] }) }) }),
      /* @__PURE__ */ t(Ce, { size: { xs: 6, sm: 3, md: 2.4 }, children: /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ d(W, { sx: { py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }, children: [
        /* @__PURE__ */ d(f, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
          /* @__PURE__ */ t(Ls, { sx: { color: "var(--theme-text-secondary)", fontSize: 20 } }),
          /* @__PURE__ */ t(I, { variant: "h5", sx: { color: "var(--theme-text-primary)", fontWeight: 600 }, children: U.debug })
        ] }),
        /* @__PURE__ */ t(I, { variant: "caption", sx: { color: "var(--theme-text-secondary)" }, children: "Debug" })
      ] }) }) })
    ] }),
    /* @__PURE__ */ t(_, { sx: { mb: 3, bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ d(f, { sx: { display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }, children: [
      n.length > 0 && /* @__PURE__ */ d(wr, { size: "small", sx: { minWidth: 150 }, children: [
        /* @__PURE__ */ t(Sr, { sx: { color: "var(--theme-text-secondary)" }, children: "Source" }),
        /* @__PURE__ */ d(
          kr,
          {
            value: h,
            label: "Source",
            onChange: (b) => u(b.target.value),
            sx: { color: "var(--theme-text-primary)" },
            children: [
              /* @__PURE__ */ t(Ie, { value: "", children: "All Sources" }),
              n.map((b) => /* @__PURE__ */ t(Ie, { value: b.name, children: b.name }, b.name))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ d(wr, { size: "small", sx: { minWidth: 120 }, children: [
        /* @__PURE__ */ t(Sr, { sx: { color: "var(--theme-text-secondary)" }, children: "Level" }),
        /* @__PURE__ */ d(
          kr,
          {
            value: m,
            label: "Level",
            onChange: (b) => p(b.target.value),
            sx: { color: "var(--theme-text-primary)" },
            children: [
              /* @__PURE__ */ t(Ie, { value: "", children: "All Levels" }),
              /* @__PURE__ */ t(Ie, { value: "error", children: "Error" }),
              /* @__PURE__ */ t(Ie, { value: "warn", children: "Warning" }),
              /* @__PURE__ */ t(Ie, { value: "info", children: "Info" }),
              /* @__PURE__ */ t(Ie, { value: "debug", children: "Debug" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ t(
        F,
        {
          size: "small",
          placeholder: "Search logs...",
          value: C,
          onChange: (b) => S(b.target.value),
          onKeyPress: (b) => b.key === "Enter" && K(),
          sx: {
            flex: 1,
            minWidth: 200,
            "& .MuiInputBase-input": { color: "var(--theme-text-primary)" }
          },
          InputProps: {
            startAdornment: /* @__PURE__ */ t(jr, { sx: { mr: 1, color: "var(--theme-text-secondary)" } })
          }
        }
      ),
      /* @__PURE__ */ d(
        ba,
        {
          value: z,
          exclusive: !0,
          onChange: s,
          size: "small",
          "aria-label": "sort order",
          children: [
            /* @__PURE__ */ t(qr, { value: "desc", "aria-label": "newest first", children: /* @__PURE__ */ t(Se, { title: "Newest First", children: /* @__PURE__ */ t(Ms, { fontSize: "small" }) }) }),
            /* @__PURE__ */ t(qr, { value: "asc", "aria-label": "oldest first", children: /* @__PURE__ */ t(Se, { title: "Oldest First", children: /* @__PURE__ */ t(Os, { fontSize: "small" }) }) })
          ]
        }
      ),
      /* @__PURE__ */ t(Se, { title: $ ? "Pause auto-refresh" : "Enable auto-refresh (5s)", children: /* @__PURE__ */ t(
        $e,
        {
          onClick: () => g(!$),
          sx: {
            color: $ ? "var(--theme-success)" : "var(--theme-text-secondary)",
            bgcolor: $ ? "var(--theme-success)20" : "transparent"
          },
          children: $ ? /* @__PURE__ */ t(Bs, {}) : /* @__PURE__ */ t(Qt, {})
        }
      ) }),
      /* @__PURE__ */ t(Se, { title: "Refresh", children: /* @__PURE__ */ t($e, { onClick: M, sx: { color: "var(--theme-primary)" }, children: /* @__PURE__ */ t(jt, {}) }) })
    ] }) }) }),
    l && /* @__PURE__ */ t(_, { sx: { mb: 3, bgcolor: "var(--theme-surface)", border: "1px solid var(--theme-error)" }, children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ t(I, { color: "error", children: l }) }) }),
    /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)" }, children: o ? /* @__PURE__ */ t(f, { sx: { display: "flex", justifyContent: "center", p: 4 }, children: /* @__PURE__ */ t(le, {}) }) : e.length === 0 ? /* @__PURE__ */ t(W, { children: /* @__PURE__ */ t(I, { sx: { color: "var(--theme-text-secondary)", textAlign: "center" }, children: "No logs found" }) }) : /* @__PURE__ */ d(Ue, { children: [
      /* @__PURE__ */ t(Qe, { children: /* @__PURE__ */ d(Ye, { size: "small", children: [
        /* @__PURE__ */ t(Xe, { children: /* @__PURE__ */ d(me, { children: [
          /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", width: 180 }, children: "Timestamp" }),
          /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", width: 100 }, children: "Level" }),
          /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", width: 120 }, children: "Component" }),
          /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Message" })
        ] }) }),
        /* @__PURE__ */ t(Ze, { children: e.map((b, B) => /* @__PURE__ */ d(me, { hover: !0, children: [
          /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", fontFamily: "monospace", fontSize: "0.75rem" }, children: new Date(b.timestamp).toLocaleString() }),
          /* @__PURE__ */ t(N, { sx: { borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(
            te,
            {
              label: b.level.toUpperCase(),
              size: "small",
              sx: {
                bgcolor: bn(b.level) + "20",
                color: bn(b.level),
                fontSize: "0.65rem",
                height: 20
              }
            }
          ) }),
          /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", fontSize: "0.75rem" }, children: b.namespace || "-" }),
          /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)", fontFamily: "monospace", fontSize: "0.8rem", whiteSpace: "pre-wrap", wordBreak: "break-all" }, children: b.message })
        ] }, B)) })
      ] }) }),
      P > 1 && /* @__PURE__ */ t(f, { sx: { display: "flex", justifyContent: "center", p: 2 }, children: /* @__PURE__ */ t(
        va,
        {
          count: P,
          page: y,
          onChange: (b, B) => A(B),
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
const Wr = Q(/* @__PURE__ */ t("path", {
  d: "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m0 16H8V7h11z"
}), "ContentCopy"), Ws = Q(/* @__PURE__ */ t("path", {
  d: "M15 9H9v6h6zm-2 4h-2v-2h2zm8-2V9h-2V7c0-1.1-.9-2-2-2h-2V3h-2v2h-2V3H9v2H7c-1.1 0-2 .9-2 2v2H3v2h2v2H3v2h2v2c0 1.1.9 2 2 2h2v2h2v-2h2v2h2v-2h2c1.1 0 2-.9 2-2v-2h2v-2h-2v-2zm-4 6H7V7h10z"
}), "Memory"), Us = Q(/* @__PURE__ */ t("path", {
  d: "M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2zM4 6h16v10H4z"
}), "Computer"), _s = Q(/* @__PURE__ */ t("path", {
  d: "M2 20h20v-4H2zm2-3h2v2H4zM2 4v4h20V4zm4 3H4V5h2zm-4 7h20v-4H2zm2-3h2v2H4z"
}), "Storage"), Fs = Q([/* @__PURE__ */ t("path", {
  d: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8"
}, "0"), /* @__PURE__ */ t("path", {
  d: "M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"
}, "1")], "AccessTime"), Vs = Q(/* @__PURE__ */ t("path", {
  d: "m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z"
}), "Favorite");
function Cr(e) {
  if (e === 0) return "0 B";
  const r = 1024, n = ["B", "KB", "MB", "GB"], a = Math.floor(Math.log(e) / Math.log(r));
  return parseFloat((e / Math.pow(r, a)).toFixed(2)) + " " + n[a];
}
function Hs(e) {
  const r = Math.floor(e / 1e3), n = Math.floor(r / 60), a = Math.floor(n / 60), o = Math.floor(a / 24);
  return o > 0 ? `${o}d ${a % 24}h ${n % 60}m` : a > 0 ? `${a}h ${n % 60}m ${r % 60}s` : n > 0 ? `${n}m ${r % 60}s` : `${r}s`;
}
function Gs(e, r = 20) {
  switch (e) {
    case "healthy":
      return /* @__PURE__ */ t(Be, { sx: { color: "var(--theme-success)", fontSize: r } });
    case "degraded":
      return /* @__PURE__ */ t(Lt, { sx: { color: "var(--theme-warning)", fontSize: r } });
    case "unhealthy":
      return /* @__PURE__ */ t(Te, { sx: { color: "var(--theme-error)", fontSize: r } });
    default:
      return /* @__PURE__ */ t(le, { size: r });
  }
}
function Nt(e) {
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
function Ks(e) {
  return e === void 0 ? "-" : e < 1e3 ? `${e}ms` : `${(e / 1e3).toFixed(2)}s`;
}
function qs() {
  const [e, r] = x(null), [n, a] = x(null), [o, i] = x(!0), [l, c] = x(null), [h, u] = x({
    open: !1,
    message: ""
  }), m = async () => {
    i(!0);
    try {
      const [S, y] = await Promise.all([
        G.getDiagnostics(),
        G.getHealth().catch(() => null)
        // Health might not be available
      ]);
      r(S), a(y), c(null);
    } catch (S) {
      c(S instanceof Error ? S.message : "Failed to fetch diagnostics");
    } finally {
      i(!1);
    }
  };
  re(() => {
    m();
    const S = setInterval(m, 3e4);
    return () => clearInterval(S);
  }, []);
  const p = () => {
    navigator.clipboard.writeText(JSON.stringify(e, null, 2)), u({ open: !0, message: "Diagnostics copied to clipboard" });
  };
  if (o && !e)
    return /* @__PURE__ */ t(f, { sx: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }, children: /* @__PURE__ */ t(le, {}) });
  if (l)
    return /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)", border: "1px solid var(--theme-error)" }, children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ t(I, { color: "error", children: l }) }) });
  const C = e ? e.system.memory.used / e.system.memory.total * 100 : 0;
  return /* @__PURE__ */ d(f, { children: [
    /* @__PURE__ */ d(f, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }, children: [
      /* @__PURE__ */ t(I, { variant: "h4", sx: { color: "var(--theme-text-primary)" }, children: "System" }),
      /* @__PURE__ */ d(f, { sx: { display: "flex", gap: 1 }, children: [
        /* @__PURE__ */ t(Se, { title: "Copy diagnostics JSON", children: /* @__PURE__ */ t($e, { onClick: p, sx: { color: "var(--theme-primary)" }, children: /* @__PURE__ */ t(Wr, {}) }) }),
        /* @__PURE__ */ t(Se, { title: "Refresh", children: /* @__PURE__ */ t($e, { onClick: m, sx: { color: "var(--theme-primary)" }, children: /* @__PURE__ */ t(jt, {}) }) })
      ] })
    ] }),
    /* @__PURE__ */ t(I, { variant: "body2", sx: { mb: 4, color: "var(--theme-text-secondary)" }, children: "System information and diagnostics" }),
    /* @__PURE__ */ d(Ce, { container: !0, spacing: 3, children: [
      /* @__PURE__ */ t(Ce, { size: { xs: 12, md: 6 }, children: /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)", height: "100%" }, children: /* @__PURE__ */ d(W, { children: [
        /* @__PURE__ */ d(f, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 3 }, children: [
          /* @__PURE__ */ t(Us, { sx: { color: "var(--theme-primary)" } }),
          /* @__PURE__ */ t(I, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: "System Information" })
        ] }),
        /* @__PURE__ */ d(f, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: [
          /* @__PURE__ */ d(f, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(I, { sx: { color: "var(--theme-text-secondary)" }, children: "QwickApps Server" }),
            /* @__PURE__ */ t(
              te,
              {
                label: e != null && e.frameworkVersion ? `v${e.frameworkVersion}` : "N/A",
                size: "small",
                sx: { bgcolor: "var(--theme-primary)20", color: "var(--theme-primary)" }
              }
            )
          ] }),
          /* @__PURE__ */ d(f, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(I, { sx: { color: "var(--theme-text-secondary)" }, children: "Node.js" }),
            /* @__PURE__ */ t(
              te,
              {
                label: e == null ? void 0 : e.system.nodeVersion,
                size: "small",
                sx: { bgcolor: "var(--theme-background)", color: "var(--theme-text-primary)" }
              }
            )
          ] }),
          /* @__PURE__ */ d(f, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(I, { sx: { color: "var(--theme-text-secondary)" }, children: "Platform" }),
            /* @__PURE__ */ t(
              te,
              {
                label: e == null ? void 0 : e.system.platform,
                size: "small",
                sx: { bgcolor: "var(--theme-background)", color: "var(--theme-text-primary)" }
              }
            )
          ] }),
          /* @__PURE__ */ d(f, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(I, { sx: { color: "var(--theme-text-secondary)" }, children: "Architecture" }),
            /* @__PURE__ */ t(
              te,
              {
                label: e == null ? void 0 : e.system.arch,
                size: "small",
                sx: { bgcolor: "var(--theme-background)", color: "var(--theme-text-primary)" }
              }
            )
          ] })
        ] })
      ] }) }) }),
      /* @__PURE__ */ t(Ce, { size: { xs: 12, md: 6 }, children: /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)", height: "100%" }, children: /* @__PURE__ */ d(W, { children: [
        /* @__PURE__ */ d(f, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 3 }, children: [
          /* @__PURE__ */ t(Ws, { sx: { color: "var(--theme-warning)" } }),
          /* @__PURE__ */ t(I, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: "Memory Usage" })
        ] }),
        /* @__PURE__ */ d(f, { sx: { mb: 2 }, children: [
          /* @__PURE__ */ d(f, { sx: { display: "flex", justifyContent: "space-between", mb: 1 }, children: [
            /* @__PURE__ */ t(I, { sx: { color: "var(--theme-text-secondary)" }, children: "Heap Used" }),
            /* @__PURE__ */ t(I, { sx: { color: "var(--theme-text-primary)" }, children: Cr((e == null ? void 0 : e.system.memory.used) || 0) })
          ] }),
          /* @__PURE__ */ t(
            Yt,
            {
              variant: "determinate",
              value: C,
              sx: {
                height: 8,
                borderRadius: 4,
                bgcolor: "var(--theme-background)",
                "& .MuiLinearProgress-bar": {
                  bgcolor: C > 80 ? "var(--theme-error)" : "var(--theme-warning)",
                  borderRadius: 4
                }
              }
            }
          )
        ] }),
        /* @__PURE__ */ d(f, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: [
          /* @__PURE__ */ d(f, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(I, { sx: { color: "var(--theme-text-secondary)" }, children: "Heap Total" }),
            /* @__PURE__ */ t(I, { sx: { color: "var(--theme-text-primary)" }, children: Cr((e == null ? void 0 : e.system.memory.total) || 0) })
          ] }),
          /* @__PURE__ */ d(f, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(I, { sx: { color: "var(--theme-text-secondary)" }, children: "Heap Free" }),
            /* @__PURE__ */ t(I, { sx: { color: "var(--theme-text-primary)" }, children: Cr((e == null ? void 0 : e.system.memory.free) || 0) })
          ] })
        ] })
      ] }) }) }),
      /* @__PURE__ */ t(Ce, { size: { xs: 12, md: 6 }, children: /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)", height: "100%" }, children: /* @__PURE__ */ d(W, { children: [
        /* @__PURE__ */ d(f, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 3 }, children: [
          /* @__PURE__ */ t(_s, { sx: { color: "var(--theme-info)" } }),
          /* @__PURE__ */ t(I, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: "Service Info" })
        ] }),
        /* @__PURE__ */ d(f, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: [
          /* @__PURE__ */ d(f, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(I, { sx: { color: "var(--theme-text-secondary)" }, children: "Product" }),
            /* @__PURE__ */ t(I, { sx: { color: "var(--theme-text-primary)" }, children: e == null ? void 0 : e.product })
          ] }),
          /* @__PURE__ */ d(f, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(I, { sx: { color: "var(--theme-text-secondary)" }, children: "Version" }),
            /* @__PURE__ */ t(
              te,
              {
                label: (e == null ? void 0 : e.version) || "N/A",
                size: "small",
                sx: { bgcolor: "var(--theme-primary)20", color: "var(--theme-primary)" }
              }
            )
          ] }),
          /* @__PURE__ */ d(f, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(I, { sx: { color: "var(--theme-text-secondary)" }, children: "Timestamp" }),
            /* @__PURE__ */ t(I, { sx: { color: "var(--theme-text-primary)", fontSize: "0.875rem" }, children: e != null && e.timestamp ? new Date(e.timestamp).toLocaleString() : "N/A" })
          ] })
        ] })
      ] }) }) }),
      /* @__PURE__ */ t(Ce, { size: { xs: 12, md: 6 }, children: /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)", height: "100%" }, children: /* @__PURE__ */ d(W, { children: [
        /* @__PURE__ */ d(f, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 3 }, children: [
          /* @__PURE__ */ t(Fs, { sx: { color: "var(--theme-success)" } }),
          /* @__PURE__ */ t(I, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: "Uptime" })
        ] }),
        /* @__PURE__ */ t(I, { variant: "h3", sx: { color: "var(--theme-success)", mb: 1 }, children: Hs((e == null ? void 0 : e.uptime) || 0) }),
        /* @__PURE__ */ t(I, { sx: { color: "var(--theme-text-secondary)" }, children: "Service has been running without interruption" })
      ] }) }) }),
      n && /* @__PURE__ */ t(Ce, { size: { xs: 12 }, children: /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ d(W, { children: [
        /* @__PURE__ */ d(f, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 3 }, children: [
          /* @__PURE__ */ t(Vs, { sx: { color: Nt(n.status) } }),
          /* @__PURE__ */ t(I, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: "Health Checks" }),
          /* @__PURE__ */ t(
            te,
            {
              label: n.status,
              size: "small",
              sx: {
                bgcolor: Nt(n.status) + "20",
                color: Nt(n.status),
                textTransform: "capitalize",
                ml: "auto"
              }
            }
          )
        ] }),
        /* @__PURE__ */ t(Qe, { children: /* @__PURE__ */ d(Ye, { size: "small", children: [
          /* @__PURE__ */ t(Xe, { children: /* @__PURE__ */ d(me, { children: [
            /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Check" }),
            /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Status" }),
            /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Latency" }),
            /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Last Checked" })
          ] }) }),
          /* @__PURE__ */ t(Ze, { children: Object.entries(n.checks).map(([S, y]) => /* @__PURE__ */ d(me, { children: [
            /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ d(f, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
              Gs(y.status),
              /* @__PURE__ */ t(I, { fontWeight: 500, children: S })
            ] }) }),
            /* @__PURE__ */ t(N, { sx: { borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(
              te,
              {
                label: y.status,
                size: "small",
                sx: {
                  bgcolor: Nt(y.status) + "20",
                  color: Nt(y.status),
                  textTransform: "capitalize"
                }
              }
            ) }),
            /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)" }, children: Ks(y.latency) }),
            /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: new Date(y.lastChecked).toLocaleTimeString() })
          ] }, S)) })
        ] }) })
      ] }) }) }),
      /* @__PURE__ */ t(Ce, { size: { xs: 12 }, children: /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ d(W, { children: [
        /* @__PURE__ */ t(I, { variant: "h6", sx: { color: "var(--theme-text-primary)", mb: 2 }, children: "Raw Diagnostics JSON (for AI agents)" }),
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
      xa,
      {
        open: h.open,
        autoHideDuration: 2e3,
        onClose: () => u({ ...h, open: !1 }),
        anchorOrigin: { vertical: "bottom", horizontal: "center" },
        children: /* @__PURE__ */ t(ee, { severity: "success", variant: "filled", children: h.message })
      }
    )
  ] });
}
const Dr = Q(/* @__PURE__ */ t("path", {
  d: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z"
}), "Edit"), Js = Q(/* @__PURE__ */ t("path", {
  d: "M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3m3-10H5V5h10z"
}), "Save"), Qs = Q(/* @__PURE__ */ t("path", {
  d: "M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2m5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12z"
}), "Cancel"), Ur = Q(/* @__PURE__ */ t("path", {
  d: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"
}), "Delete"), Ys = Q(/* @__PURE__ */ t("path", {
  d: "M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z"
}), "ExpandMore"), Xs = Q(/* @__PURE__ */ t("path", {
  d: "m12 8-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"
}), "ExpandLess");
function vn(e) {
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
function Zs(e) {
  switch (e) {
    case "enabled":
      return /* @__PURE__ */ t(Be, { sx: { color: "var(--theme-success)" } });
    case "error":
      return /* @__PURE__ */ t(Te, { sx: { color: "var(--theme-error)" } });
    case "disabled":
    default:
      return /* @__PURE__ */ t(Lr, { sx: { color: "var(--theme-text-secondary)" } });
  }
}
const xn = {
  domain: "",
  clientId: "",
  clientSecret: "",
  baseUrl: "",
  secret: "",
  audience: "",
  scopes: ["openid", "profile", "email"],
  allowedRoles: [],
  allowedDomains: []
}, Cn = {
  url: "",
  anonKey: ""
}, wn = {
  username: "",
  password: "",
  realm: "Protected Area"
}, Sn = {
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
function el() {
  var vt, Ke, xt;
  const [e, r] = x(null), [n, a] = x(!0), [o, i] = x(null), [l, c] = x(null), [h, u] = x(!1), [m, p] = x(!1), [C, S] = x(!1), [y, A] = x(null), [E, R] = x(""), [O, $] = x(xn), [g, z] = x(Cn), [T, V] = x(wn), [U, M] = x(Sn), [de, K] = x(!0), [s, P] = x(""), [b, B] = x({
    enabled: !1,
    clientId: "",
    clientSecret: ""
  }), [L, ne] = x({
    enabled: !1,
    clientId: "",
    clientSecret: ""
  }), [H, fe] = x({
    enabled: !1,
    clientId: "",
    clientSecret: "",
    keyId: "",
    teamId: ""
  }), [be, yt] = x(!1), [pe, he] = x(!1), D = ye(async () => {
    var k, q, Ne, Ct;
    a(!0), i(null);
    try {
      const ge = await G.getAuthConfig();
      if (r(ge), ge.runtimeConfig) {
        const xe = ge.runtimeConfig;
        if (R(xe.adapter || ""), K(xe.settings.authRequired ?? !0), P(((k = xe.settings.excludePaths) == null ? void 0 : k.join(", ")) || ""), xe.config.auth0 && $({ ...xn, ...xe.config.auth0 }), xe.config.supabase && z({ ...Cn, ...xe.config.supabase }), xe.config.basic && V({ ...wn, ...xe.config.basic }), xe.config.supertokens) {
          const ve = xe.config.supertokens;
          M({ ...Sn, ...ve }), (q = ve.socialProviders) != null && q.google && B({
            enabled: !0,
            clientId: ve.socialProviders.google.clientId,
            clientSecret: ve.socialProviders.google.clientSecret
          }), (Ne = ve.socialProviders) != null && Ne.github && ne({
            enabled: !0,
            clientId: ve.socialProviders.github.clientId,
            clientSecret: ve.socialProviders.github.clientSecret
          }), (Ct = ve.socialProviders) != null && Ct.apple && fe({
            enabled: !0,
            clientId: ve.socialProviders.apple.clientId,
            clientSecret: ve.socialProviders.apple.clientSecret,
            keyId: ve.socialProviders.apple.keyId,
            teamId: ve.socialProviders.apple.teamId
          });
        }
      } else ge.adapter && R(ge.adapter);
    } catch (ge) {
      i(ge instanceof Error ? ge.message : "Failed to fetch auth status");
    } finally {
      a(!1);
    }
  }, []);
  re(() => {
    D();
  }, [D]);
  const Oe = (k, q) => {
    navigator.clipboard.writeText(q), c(k), setTimeout(() => c(null), 2e3);
  }, Ge = () => {
    u(!0), A(null);
  }, ue = () => {
    u(!1), A(null), D();
  }, Pe = (k) => JSON.parse(JSON.stringify(k)), je = () => {
    switch (E) {
      case "auth0":
        return Pe(O);
      case "supabase":
        return Pe(g);
      case "basic":
        return Pe(T);
      case "supertokens": {
        const k = { ...U }, q = {};
        return b.enabled && (q.google = {
          clientId: b.clientId,
          clientSecret: b.clientSecret
        }), L.enabled && (q.github = {
          clientId: L.clientId,
          clientSecret: L.clientSecret
        }), H.enabled && (q.apple = {
          clientId: H.clientId,
          clientSecret: H.clientSecret,
          keyId: H.keyId || "",
          teamId: H.teamId || ""
        }), Object.keys(q).length > 0 && (k.socialProviders = q), Pe(k);
      }
      default:
        return {};
    }
  }, _t = async () => {
    if (E) {
      S(!0), A(null);
      try {
        const k = await G.testAuthProvider({
          adapter: E,
          config: je()
        });
        A(k);
      } catch (k) {
        A({
          success: !1,
          message: k instanceof Error ? k.message : "Test failed"
        });
      } finally {
        S(!1);
      }
    }
  }, ur = async () => {
    if (e != null && e.adapter) {
      S(!0), A(null);
      try {
        const k = await G.testCurrentAuthProvider();
        A(k);
      } catch (k) {
        A({
          success: !1,
          message: k instanceof Error ? k.message : "Test failed"
        });
      } finally {
        S(!1);
      }
    }
  }, bt = async () => {
    if (E) {
      p(!0), i(null);
      try {
        const k = {
          adapter: E,
          config: je(),
          settings: {
            authRequired: de,
            excludePaths: s.split(",").map((q) => q.trim()).filter(Boolean)
          }
        };
        await G.updateAuthConfig(k), u(!1), await D();
      } catch (k) {
        i(k instanceof Error ? k.message : "Failed to save configuration");
      } finally {
        p(!1);
      }
    }
  }, rt = async () => {
    p(!0), i(null);
    try {
      await G.deleteAuthConfig(), he(!1), u(!1), await D();
    } catch (k) {
      i(k instanceof Error ? k.message : "Failed to delete configuration");
    } finally {
      p(!1);
    }
  };
  if (n)
    return /* @__PURE__ */ t(f, { sx: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }, children: /* @__PURE__ */ t(le, {}) });
  const nt = e != null && e.config ? Object.entries(e.config) : [];
  return /* @__PURE__ */ d(f, { children: [
    /* @__PURE__ */ d(f, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }, children: [
      /* @__PURE__ */ t(I, { variant: "h4", sx: { color: "var(--theme-text-primary)" }, children: "Authentication" }),
      /* @__PURE__ */ t(f, { sx: { display: "flex", gap: 1 }, children: !h && /* @__PURE__ */ d(Ue, { children: [
        /* @__PURE__ */ t(Se, { title: "Edit Configuration", children: /* @__PURE__ */ t($e, { onClick: Ge, sx: { color: "var(--theme-primary)" }, children: /* @__PURE__ */ t(Dr, {}) }) }),
        /* @__PURE__ */ t(Se, { title: "Refresh", children: /* @__PURE__ */ t($e, { onClick: D, sx: { color: "var(--theme-text-secondary)" }, children: /* @__PURE__ */ t(jt, {}) }) })
      ] }) })
    ] }),
    /* @__PURE__ */ t(I, { variant: "body2", sx: { mb: 4, color: "var(--theme-text-secondary)" }, children: h ? "Configure authentication provider" : "Auth plugin configuration status" }),
    o && /* @__PURE__ */ t(ee, { severity: "error", sx: { mb: 2 }, onClose: () => i(null), children: o }),
    h ? /* @__PURE__ */ d(f, { children: [
      /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)", mb: 3 }, children: /* @__PURE__ */ d(W, { children: [
        /* @__PURE__ */ t(I, { variant: "h6", sx: { color: "var(--theme-text-primary)", mb: 2 }, children: "Provider Selection" }),
        /* @__PURE__ */ d(wr, { fullWidth: !0, sx: { mb: 2 }, children: [
          /* @__PURE__ */ t(Sr, { sx: { color: "var(--theme-text-secondary)" }, children: "Auth Provider" }),
          /* @__PURE__ */ d(
            kr,
            {
              value: E,
              onChange: (k) => R(k.target.value),
              label: "Auth Provider",
              sx: { color: "var(--theme-text-primary)" },
              children: [
                /* @__PURE__ */ t(Ie, { value: "", children: /* @__PURE__ */ t("em", { children: "None (Disabled)" }) }),
                /* @__PURE__ */ t(Ie, { value: "supertokens", children: "SuperTokens" }),
                /* @__PURE__ */ t(Ie, { value: "auth0", children: "Auth0" }),
                /* @__PURE__ */ t(Ie, { value: "supabase", children: "Supabase" }),
                /* @__PURE__ */ t(Ie, { value: "basic", children: "Basic Auth" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ d(f, { sx: { display: "flex", gap: 2, alignItems: "center" }, children: [
          /* @__PURE__ */ t(
            At,
            {
              control: /* @__PURE__ */ t(
                Tt,
                {
                  checked: de,
                  onChange: (k) => K(k.target.checked),
                  sx: { "& .MuiSwitch-switchBase.Mui-checked": { color: "var(--theme-primary)" } }
                }
              ),
              label: "Auth Required",
              sx: { color: "var(--theme-text-primary)" }
            }
          ),
          /* @__PURE__ */ t(
            F,
            {
              label: "Exclude Paths (comma-separated)",
              value: s,
              onChange: (k) => P(k.target.value),
              size: "small",
              sx: { flex: 1, "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } },
              placeholder: "/api/health, /api/public/*"
            }
          )
        ] })
      ] }) }),
      E === "auth0" && /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)", mb: 3 }, children: /* @__PURE__ */ d(W, { children: [
        /* @__PURE__ */ t(I, { variant: "h6", sx: { color: "var(--theme-text-primary)", mb: 2 }, children: "Auth0 Configuration" }),
        /* @__PURE__ */ d(f, { sx: { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }, children: [
          /* @__PURE__ */ t(
            F,
            {
              label: "Domain",
              value: O.domain,
              onChange: (k) => $({ ...O, domain: k.target.value }),
              required: !0,
              placeholder: "your-tenant.auth0.com",
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          ),
          /* @__PURE__ */ t(
            F,
            {
              label: "Client ID",
              value: O.clientId,
              onChange: (k) => $({ ...O, clientId: k.target.value }),
              required: !0,
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          ),
          /* @__PURE__ */ t(
            F,
            {
              label: "Client Secret",
              type: "password",
              value: O.clientSecret,
              onChange: (k) => $({ ...O, clientSecret: k.target.value }),
              required: !0,
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          ),
          /* @__PURE__ */ t(
            F,
            {
              label: "Base URL",
              value: O.baseUrl,
              onChange: (k) => $({ ...O, baseUrl: k.target.value }),
              required: !0,
              placeholder: "https://your-app.com",
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          ),
          /* @__PURE__ */ t(
            F,
            {
              label: "Session Secret",
              type: "password",
              value: O.secret,
              onChange: (k) => $({ ...O, secret: k.target.value }),
              required: !0,
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          ),
          /* @__PURE__ */ t(
            F,
            {
              label: "API Audience (optional)",
              value: O.audience || "",
              onChange: (k) => $({ ...O, audience: k.target.value }),
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          )
        ] })
      ] }) }),
      E === "supabase" && /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)", mb: 3 }, children: /* @__PURE__ */ d(W, { children: [
        /* @__PURE__ */ t(I, { variant: "h6", sx: { color: "var(--theme-text-primary)", mb: 2 }, children: "Supabase Configuration" }),
        /* @__PURE__ */ d(f, { sx: { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }, children: [
          /* @__PURE__ */ t(
            F,
            {
              label: "Project URL",
              value: g.url,
              onChange: (k) => z({ ...g, url: k.target.value }),
              required: !0,
              placeholder: "https://your-project.supabase.co",
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          ),
          /* @__PURE__ */ t(
            F,
            {
              label: "Anon Key",
              type: "password",
              value: g.anonKey,
              onChange: (k) => z({ ...g, anonKey: k.target.value }),
              required: !0,
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          )
        ] })
      ] }) }),
      E === "basic" && /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)", mb: 3 }, children: /* @__PURE__ */ d(W, { children: [
        /* @__PURE__ */ t(I, { variant: "h6", sx: { color: "var(--theme-text-primary)", mb: 2 }, children: "Basic Auth Configuration" }),
        /* @__PURE__ */ d(f, { sx: { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2 }, children: [
          /* @__PURE__ */ t(
            F,
            {
              label: "Username",
              value: T.username,
              onChange: (k) => V({ ...T, username: k.target.value }),
              required: !0,
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          ),
          /* @__PURE__ */ t(
            F,
            {
              label: "Password",
              type: "password",
              value: T.password,
              onChange: (k) => V({ ...T, password: k.target.value }),
              required: !0,
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          ),
          /* @__PURE__ */ t(
            F,
            {
              label: "Realm (optional)",
              value: T.realm || "",
              onChange: (k) => V({ ...T, realm: k.target.value }),
              placeholder: "Protected Area",
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          )
        ] })
      ] }) }),
      E === "supertokens" && /* @__PURE__ */ d(Ue, { children: [
        /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)", mb: 3 }, children: /* @__PURE__ */ d(W, { children: [
          /* @__PURE__ */ t(I, { variant: "h6", sx: { color: "var(--theme-text-primary)", mb: 2 }, children: "SuperTokens Configuration" }),
          /* @__PURE__ */ d(f, { sx: { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }, children: [
            /* @__PURE__ */ t(
              F,
              {
                label: "Connection URI",
                value: U.connectionUri,
                onChange: (k) => M({ ...U, connectionUri: k.target.value }),
                required: !0,
                placeholder: "http://localhost:3567",
                sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
              }
            ),
            /* @__PURE__ */ t(
              F,
              {
                label: "API Key (optional)",
                type: "password",
                value: U.apiKey || "",
                onChange: (k) => M({ ...U, apiKey: k.target.value }),
                sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
              }
            ),
            /* @__PURE__ */ t(
              F,
              {
                label: "App Name",
                value: U.appName,
                onChange: (k) => M({ ...U, appName: k.target.value }),
                required: !0,
                sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
              }
            ),
            /* @__PURE__ */ t(
              F,
              {
                label: "API Domain",
                value: U.apiDomain,
                onChange: (k) => M({ ...U, apiDomain: k.target.value }),
                required: !0,
                placeholder: "http://localhost:3000",
                sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
              }
            ),
            /* @__PURE__ */ t(
              F,
              {
                label: "Website Domain",
                value: U.websiteDomain,
                onChange: (k) => M({ ...U, websiteDomain: k.target.value }),
                required: !0,
                placeholder: "http://localhost:3000",
                sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
              }
            ),
            /* @__PURE__ */ t(
              F,
              {
                label: "API Base Path",
                value: U.apiBasePath || "/auth",
                onChange: (k) => M({ ...U, apiBasePath: k.target.value }),
                sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
              }
            )
          ] }),
          /* @__PURE__ */ t(f, { sx: { mt: 2 }, children: /* @__PURE__ */ t(
            At,
            {
              control: /* @__PURE__ */ t(
                Tt,
                {
                  checked: U.enableEmailPassword ?? !0,
                  onChange: (k) => M({ ...U, enableEmailPassword: k.target.checked }),
                  sx: { "& .MuiSwitch-switchBase.Mui-checked": { color: "var(--theme-primary)" } }
                }
              ),
              label: "Enable Email/Password Auth",
              sx: { color: "var(--theme-text-primary)" }
            }
          ) })
        ] }) }),
        /* @__PURE__ */ d(_, { sx: { bgcolor: "var(--theme-surface)", mb: 3 }, children: [
          /* @__PURE__ */ t(W, { sx: { pb: be ? 2 : 0 }, children: /* @__PURE__ */ d(
            f,
            {
              sx: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer"
              },
              onClick: () => yt(!be),
              children: [
                /* @__PURE__ */ t(I, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: "Social Login Providers" }),
                be ? /* @__PURE__ */ t(Xs, {}) : /* @__PURE__ */ t(Ys, {})
              ]
            }
          ) }),
          /* @__PURE__ */ t(Ca, { in: be, children: /* @__PURE__ */ d(W, { sx: { pt: 0 }, children: [
            /* @__PURE__ */ t(An, { sx: { mb: 2 } }),
            /* @__PURE__ */ d(f, { sx: { mb: 3 }, children: [
              /* @__PURE__ */ t(
                At,
                {
                  control: /* @__PURE__ */ t(
                    Tt,
                    {
                      checked: b.enabled,
                      onChange: (k) => B({ ...b, enabled: k.target.checked }),
                      sx: { "& .MuiSwitch-switchBase.Mui-checked": { color: "var(--theme-primary)" } }
                    }
                  ),
                  label: "Google",
                  sx: { color: "var(--theme-text-primary)", mb: 1 }
                }
              ),
              b.enabled && /* @__PURE__ */ d(f, { sx: { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, ml: 4 }, children: [
                /* @__PURE__ */ t(
                  F,
                  {
                    label: "Client ID",
                    size: "small",
                    value: b.clientId,
                    onChange: (k) => B({ ...b, clientId: k.target.value }),
                    sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
                  }
                ),
                /* @__PURE__ */ t(
                  F,
                  {
                    label: "Client Secret",
                    size: "small",
                    type: "password",
                    value: b.clientSecret,
                    onChange: (k) => B({ ...b, clientSecret: k.target.value }),
                    sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ d(f, { sx: { mb: 3 }, children: [
              /* @__PURE__ */ t(
                At,
                {
                  control: /* @__PURE__ */ t(
                    Tt,
                    {
                      checked: L.enabled,
                      onChange: (k) => ne({ ...L, enabled: k.target.checked }),
                      sx: { "& .MuiSwitch-switchBase.Mui-checked": { color: "var(--theme-primary)" } }
                    }
                  ),
                  label: "GitHub",
                  sx: { color: "var(--theme-text-primary)", mb: 1 }
                }
              ),
              L.enabled && /* @__PURE__ */ d(f, { sx: { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, ml: 4 }, children: [
                /* @__PURE__ */ t(
                  F,
                  {
                    label: "Client ID",
                    size: "small",
                    value: L.clientId,
                    onChange: (k) => ne({ ...L, clientId: k.target.value }),
                    sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
                  }
                ),
                /* @__PURE__ */ t(
                  F,
                  {
                    label: "Client Secret",
                    size: "small",
                    type: "password",
                    value: L.clientSecret,
                    onChange: (k) => ne({ ...L, clientSecret: k.target.value }),
                    sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ d(f, { children: [
              /* @__PURE__ */ t(
                At,
                {
                  control: /* @__PURE__ */ t(
                    Tt,
                    {
                      checked: H.enabled,
                      onChange: (k) => fe({ ...H, enabled: k.target.checked }),
                      sx: { "& .MuiSwitch-switchBase.Mui-checked": { color: "var(--theme-primary)" } }
                    }
                  ),
                  label: "Apple",
                  sx: { color: "var(--theme-text-primary)", mb: 1 }
                }
              ),
              H.enabled && /* @__PURE__ */ d(f, { sx: { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, ml: 4 }, children: [
                /* @__PURE__ */ t(
                  F,
                  {
                    label: "Client ID",
                    size: "small",
                    value: H.clientId,
                    onChange: (k) => fe({ ...H, clientId: k.target.value }),
                    sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
                  }
                ),
                /* @__PURE__ */ t(
                  F,
                  {
                    label: "Client Secret",
                    size: "small",
                    type: "password",
                    value: H.clientSecret,
                    onChange: (k) => fe({ ...H, clientSecret: k.target.value }),
                    sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
                  }
                ),
                /* @__PURE__ */ t(
                  F,
                  {
                    label: "Key ID",
                    size: "small",
                    value: H.keyId || "",
                    onChange: (k) => fe({ ...H, keyId: k.target.value }),
                    sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
                  }
                ),
                /* @__PURE__ */ t(
                  F,
                  {
                    label: "Team ID",
                    size: "small",
                    value: H.teamId || "",
                    onChange: (k) => fe({ ...H, teamId: k.target.value }),
                    sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
                  }
                )
              ] })
            ] })
          ] }) })
        ] })
      ] }),
      y && /* @__PURE__ */ d(ee, { severity: y.success ? "success" : "error", sx: { mb: 3 }, children: [
        /* @__PURE__ */ t(I, { variant: "body2", sx: { fontWeight: 600 }, children: y.success ? "Connection Successful" : "Connection Failed" }),
        /* @__PURE__ */ t(I, { variant: "body2", children: y.message }),
        ((vt = y.details) == null ? void 0 : vt.latency) && /* @__PURE__ */ d(I, { variant: "caption", sx: { display: "block", mt: 0.5 }, children: [
          "Latency: ",
          y.details.latency,
          "ms"
        ] })
      ] }),
      /* @__PURE__ */ d(f, { sx: { display: "flex", gap: 2, justifyContent: "space-between" }, children: [
        /* @__PURE__ */ d(f, { sx: { display: "flex", gap: 2 }, children: [
          /* @__PURE__ */ t(
            ze,
            {
              variant: "outlined",
              startIcon: /* @__PURE__ */ t(Qs, {}),
              onClick: ue,
              disabled: m,
              sx: {
                color: "var(--theme-text-secondary)",
                borderColor: "var(--theme-border)"
              },
              children: "Cancel"
            }
          ),
          (e == null ? void 0 : e.runtimeConfig) && /* @__PURE__ */ t(
            ze,
            {
              variant: "outlined",
              color: "error",
              startIcon: /* @__PURE__ */ t(Ur, {}),
              onClick: () => he(!0),
              disabled: m,
              children: "Reset to Env Vars"
            }
          )
        ] }),
        /* @__PURE__ */ d(f, { sx: { display: "flex", gap: 2 }, children: [
          /* @__PURE__ */ t(
            ze,
            {
              variant: "outlined",
              startIcon: C ? /* @__PURE__ */ t(le, { size: 16 }) : /* @__PURE__ */ t(Qt, {}),
              onClick: _t,
              disabled: !E || C || m,
              sx: {
                color: "var(--theme-text-primary)",
                borderColor: "var(--theme-border)"
              },
              children: "Test Connection"
            }
          ),
          /* @__PURE__ */ t(
            ze,
            {
              variant: "contained",
              startIcon: m ? /* @__PURE__ */ t(le, { size: 16, sx: { color: "white" } }) : /* @__PURE__ */ t(Js, {}),
              onClick: bt,
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
    ] }) : /* @__PURE__ */ d(Ue, { children: [
      /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)", mb: 3 }, children: /* @__PURE__ */ d(W, { children: [
        /* @__PURE__ */ d(f, { sx: { display: "flex", alignItems: "center", gap: 2, mb: 2 }, children: [
          Zs((e == null ? void 0 : e.state) || "disabled"),
          /* @__PURE__ */ d(f, { sx: { flex: 1 }, children: [
            /* @__PURE__ */ d(I, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: [
              "Status:",
              " ",
              /* @__PURE__ */ t(
                te,
                {
                  label: ((Ke = e == null ? void 0 : e.state) == null ? void 0 : Ke.toUpperCase()) || "UNKNOWN",
                  size: "small",
                  sx: {
                    bgcolor: `${vn((e == null ? void 0 : e.state) || "disabled")}20`,
                    color: vn((e == null ? void 0 : e.state) || "disabled"),
                    fontWeight: 600
                  }
                }
              )
            ] }),
            (e == null ? void 0 : e.adapter) && /* @__PURE__ */ d(I, { variant: "body2", sx: { color: "var(--theme-text-secondary)", mt: 0.5 }, children: [
              "Adapter: ",
              /* @__PURE__ */ t("strong", { children: e.adapter })
            ] })
          ] }),
          (e == null ? void 0 : e.state) === "enabled" && (e == null ? void 0 : e.adapter) && /* @__PURE__ */ t(
            ze,
            {
              variant: "outlined",
              size: "small",
              startIcon: C ? /* @__PURE__ */ t(le, { size: 14 }) : /* @__PURE__ */ t(Qt, {}),
              onClick: ur,
              disabled: C,
              sx: {
                color: "var(--theme-text-primary)",
                borderColor: "var(--theme-border)"
              },
              children: "Test Connection"
            }
          )
        ] }),
        y && !h && /* @__PURE__ */ d(ee, { severity: y.success ? "success" : "error", sx: { mb: 2 }, children: [
          /* @__PURE__ */ t(I, { variant: "body2", sx: { fontWeight: 600 }, children: y.success ? "Connection Successful" : "Connection Failed" }),
          /* @__PURE__ */ t(I, { variant: "body2", children: y.message }),
          ((xt = y.details) == null ? void 0 : xt.latency) && /* @__PURE__ */ d(I, { variant: "caption", sx: { display: "block", mt: 0.5 }, children: [
            "Latency: ",
            y.details.latency,
            "ms"
          ] })
        ] }),
        (e == null ? void 0 : e.state) === "enabled" && !(e != null && e.runtimeConfig) && /* @__PURE__ */ d(ee, { severity: "success", sx: { mb: 2 }, children: [
          /* @__PURE__ */ t(I, { variant: "body2", sx: { fontWeight: 600 }, children: "Configured via Environment Variables" }),
          /* @__PURE__ */ t(I, { variant: "body2", children: 'Authentication is configured using environment variables. Click "Edit" to override with runtime configuration (requires PostgreSQL).' })
        ] }),
        (e == null ? void 0 : e.runtimeConfig) && /* @__PURE__ */ t(
          te,
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
        (e == null ? void 0 : e.state) === "error" && e.error && /* @__PURE__ */ t(ee, { severity: "error", sx: { mb: 2 }, children: e.error }),
        (e == null ? void 0 : e.missingVars) && e.missingVars.length > 0 && /* @__PURE__ */ d(ee, { severity: "warning", sx: { mb: 2 }, children: [
          /* @__PURE__ */ t(I, { variant: "body2", sx: { fontWeight: 600, mb: 1 }, children: "Missing environment variables:" }),
          /* @__PURE__ */ t(f, { component: "ul", sx: { m: 0, pl: 2 }, children: e.missingVars.map((k) => /* @__PURE__ */ t("li", { children: /* @__PURE__ */ t("code", { children: k }) }, k)) })
        ] }),
        (e == null ? void 0 : e.state) === "disabled" && /* @__PURE__ */ d(ee, { severity: "info", children: [
          /* @__PURE__ */ d(I, { variant: "body2", children: [
            "Authentication is disabled. Click the edit button to configure a provider, or set the",
            " ",
            /* @__PURE__ */ t("code", { children: "AUTH_ADAPTER" }),
            " environment variable."
          ] }),
          /* @__PURE__ */ d(I, { variant: "body2", sx: { mt: 1 }, children: [
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
      nt.length > 0 && /* @__PURE__ */ d(_, { sx: { bgcolor: "var(--theme-surface)" }, children: [
        /* @__PURE__ */ t(W, { sx: { pb: 0 }, children: /* @__PURE__ */ t(I, { variant: "h6", sx: { color: "var(--theme-text-primary)", mb: 2 }, children: "Current Configuration" }) }),
        /* @__PURE__ */ t(Qe, { children: /* @__PURE__ */ d(Ye, { size: "small", children: [
          /* @__PURE__ */ t(Xe, { children: /* @__PURE__ */ d(me, { children: [
            /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Variable" }),
            /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Value" }),
            /* @__PURE__ */ t(
              N,
              {
                sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", width: 60 },
                children: "Actions"
              }
            )
          ] }) }),
          /* @__PURE__ */ t(Ze, { children: nt.map(([k, q]) => /* @__PURE__ */ d(me, { children: [
            /* @__PURE__ */ t(N, { sx: { borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(
              I,
              {
                sx: { color: "var(--theme-text-primary)", fontFamily: "monospace", fontSize: 13 },
                children: k
              }
            ) }),
            /* @__PURE__ */ t(N, { sx: { borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(
              I,
              {
                sx: {
                  color: q.includes("*") ? "var(--theme-text-secondary)" : "var(--theme-text-primary)",
                  fontFamily: "monospace",
                  fontSize: 13
                },
                children: q
              }
            ) }),
            /* @__PURE__ */ t(N, { sx: { borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(Se, { title: l === k ? "Copied!" : "Copy value", children: /* @__PURE__ */ t(
              $e,
              {
                size: "small",
                onClick: () => Oe(k, q),
                sx: { color: l === k ? "var(--theme-success)" : "var(--theme-text-secondary)" },
                children: /* @__PURE__ */ t(Wr, { fontSize: "small" })
              }
            ) }) })
          ] }, k)) })
        ] }) })
      ] }),
      (e == null ? void 0 : e.state) === "enabled" && nt.length === 0 && /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ t(I, { sx: { color: "var(--theme-text-secondary)", textAlign: "center" }, children: "No configuration details available" }) }) })
    ] }),
    /* @__PURE__ */ d(wa, { open: pe, onClose: () => he(!1), children: [
      /* @__PURE__ */ t(Sa, { children: "Reset to Environment Variables?" }),
      /* @__PURE__ */ t(ka, { children: /* @__PURE__ */ t(I, { children: "This will delete the runtime configuration from the database. The auth plugin will fall back to environment variables on the next request." }) }),
      /* @__PURE__ */ d(Ia, { children: [
        /* @__PURE__ */ t(ze, { onClick: () => he(!1), children: "Cancel" }),
        /* @__PURE__ */ t(ze, { onClick: rt, color: "error", disabled: m, children: m ? /* @__PURE__ */ t(le, { size: 20 }) : "Reset" })
      ] })
    ] })
  ] });
}
const tl = Q(/* @__PURE__ */ t("path", {
  d: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
}), "Home");
function rl() {
  const e = $n();
  return /* @__PURE__ */ d(
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
        /* @__PURE__ */ t(I, { variant: "h1", sx: { color: "var(--theme-primary)", mb: 2 }, children: "404" }),
        /* @__PURE__ */ t(I, { variant: "h5", sx: { color: "var(--theme-text-primary)", mb: 1 }, children: "Page Not Found" }),
        /* @__PURE__ */ t(I, { sx: { color: "var(--theme-text-secondary)", mb: 4 }, children: "The page you're looking for doesn't exist or has been moved." }),
        /* @__PURE__ */ t(
          ze,
          {
            variant: "contained",
            startIcon: /* @__PURE__ */ t(tl, {}),
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
function nl({ version: e }) {
  return /* @__PURE__ */ t(f, { sx: { display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, py: 2 }, children: /* @__PURE__ */ d(j, { variant: "caption", customColor: "var(--theme-text-secondary)", children: [
    "Built with",
    " ",
    /* @__PURE__ */ t(
      Ea,
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
function al() {
  return [
    { id: "dashboard", label: "Dashboard", route: "/", icon: "dashboard" },
    { id: "logs", label: "Logs", route: "/logs", icon: "article" },
    { id: "auth", label: "Auth", route: "/auth", icon: "lock" },
    { id: "system", label: "System", route: "/system", icon: "settings" }
  ];
}
function gl({
  productName: e = "Control Panel",
  logo: r,
  footerContent: n,
  dashboardWidgets: a = [],
  widgetComponents: o = [],
  navigationItems: i = [],
  showBaseNavigation: l = !0,
  hideBaseNavItems: c = [],
  showThemeSwitcher: h = !0,
  showPaletteSwitcher: u = !0,
  basePath: m = "",
  // Keep for backwards compatibility but unused (API always at /api)
  children: p
}) {
  const [C, S] = x(""), y = [...Ns(), ...o], A = "";
  G.setBaseUrl(A), re(() => {
    G.getInfo().then((g) => S(g.version || "")).catch(() => {
    });
  }, [A]);
  const R = [
    ...l ? al().filter((g) => !c.includes(g.id)) : [],
    ...i
  ];
  return /* @__PURE__ */ t(ms, { initialComponents: y, children: /* @__PURE__ */ t(hs, { initialWidgets: a, children: /* @__PURE__ */ t(
    Da,
    {
      config: Ra,
      logo: r || /* @__PURE__ */ t(za, { name: e }),
      footerContent: n || /* @__PURE__ */ t(nl, { version: C }),
      enableScaffolding: !0,
      navigationItems: R,
      showThemeSwitcher: h,
      showPaletteSwitcher: u,
      children: /* @__PURE__ */ d(ma, { children: [
        l && /* @__PURE__ */ d(Ue, { children: [
          !c.includes("dashboard") && /* @__PURE__ */ t($t, { path: "/", element: /* @__PURE__ */ t(zs, {}) }),
          !c.includes("logs") && /* @__PURE__ */ t($t, { path: "/logs", element: /* @__PURE__ */ t(js, {}) }),
          !c.includes("auth") && /* @__PURE__ */ t($t, { path: "/auth", element: /* @__PURE__ */ t(el, {}) }),
          !c.includes("system") && /* @__PURE__ */ t($t, { path: "/system", element: /* @__PURE__ */ t(qs, {}) })
        ] }),
        p,
        /* @__PURE__ */ t($t, { path: "*", element: /* @__PURE__ */ t(rl, {}) })
      ] })
    }
  ) }) });
}
const Mt = Q(/* @__PURE__ */ t("path", {
  d: "m21.41 11.58-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.06-.59-1.42M5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7"
}), "LocalOffer");
function yl({
  title: e = "User Management",
  subtitle: r = "Manage users, bans, and entitlements",
  features: n,
  headerActions: a,
  onUserSelect: o
}) {
  const [i, l] = x({
    users: (n == null ? void 0 : n.users) ?? !0,
    bans: (n == null ? void 0 : n.bans) ?? !1,
    entitlements: (n == null ? void 0 : n.entitlements) ?? !1,
    entitlementsReadonly: (n == null ? void 0 : n.entitlementsReadonly) ?? !0
  }), [c, h] = x(!!n), [u, m] = x(0), [p, C] = x([]), [S, y] = x(0), [A, E] = x(0), [R, O] = x(25), [$, g] = x(""), [z, T] = x({}), [V, U] = x([]), [M, de] = x(0), [K, s] = x([]), [P, b] = x(0), [B, L] = x(!0), [ne, H] = x(null), [fe, be] = x(null), [yt, pe] = x(!1), [he, D] = x({
    email: "",
    reason: "",
    expiresAt: ""
  }), [Oe, Ge] = x(!1), [ue, Pe] = x({
    email: "",
    name: "",
    role: "",
    expiresInDays: 7
  }), [je, _t] = x(null), [ur, bt] = x(!1), [rt, nt] = x(""), [vt, Ke] = x(!1), [xt, k] = x(!1), [q, Ne] = x(null), [Ct, ge] = x(null), [xe, ve] = x([]), [wt, _r] = x(""), [Zn, Fr] = x(!1);
  re(() => {
    n || G.detectFeatures().then((w) => {
      l(w), h(!0);
    }).catch(() => {
      h(!0);
    });
  }, [n]), re(() => {
    c && i.entitlements && !i.entitlementsReadonly && G.getAvailableEntitlements().then(ve).catch(() => {
    });
  }, [c, i.entitlements, i.entitlementsReadonly]);
  const St = ye(async () => {
    var w;
    if (i.users) {
      L(!0);
      try {
        const J = await G.getUsers({
          limit: R,
          page: A,
          search: $ || void 0
        });
        if (C(J.users || []), y(J.total), H(null), i.entitlements && ((w = J.users) != null && w.length)) {
          const It = {};
          await Promise.all(
            J.users.map(async (Et) => {
              try {
                const sa = await G.getEntitlements(Et.email);
                It[Et.email] = sa.entitlements.length;
              } catch {
                It[Et.email] = 0;
              }
            })
          ), T((Et) => ({ ...Et, ...It }));
        }
      } catch (J) {
        H(J instanceof Error ? J.message : "Failed to fetch users");
      } finally {
        L(!1);
      }
    }
  }, [i.users, i.entitlements, A, R, $]), at = ye(async () => {
    if (i.bans) {
      L(!0);
      try {
        const w = await G.getBans();
        U(w.bans || []), de(w.total), H(null);
      } catch (w) {
        H(w instanceof Error ? w.message : "Failed to fetch bans");
      } finally {
        L(!1);
      }
    }
  }, [i.bans]), Vr = ye(async () => {
    if (i.users) {
      L(!0);
      try {
        const w = await G.getInvitations();
        s(w.users || []), b(w.total), H(null);
      } catch (w) {
        H(w instanceof Error ? w.message : "Failed to fetch invitations");
      } finally {
        L(!1);
      }
    }
  }, [i.users]);
  re(() => {
    c && (u === 0 && i.users ? St() : u === 1 && i.bans ? at() : u === 2 && i.users && Vr());
  }, [u, c, i.users, i.bans, St, at, Vr]), re(() => {
    c && i.bans && at();
  }, [c, i.bans, at]), re(() => {
    if (!c) return;
    const w = setTimeout(() => {
      u === 0 && i.users && (E(0), St());
    }, 300);
    return () => clearTimeout(w);
  }, [$, u, c, i.users, St]);
  const ea = async () => {
    try {
      await G.banUser(he.email, he.reason, he.expiresAt || void 0), be("User banned successfully"), pe(!1), D({ email: "", reason: "", expiresAt: "" }), at();
    } catch (w) {
      H(w instanceof Error ? w.message : "Failed to ban user");
    }
  }, ta = async (w) => {
    if (confirm("Unban this user?"))
      try {
        await G.unbanUser(w), be("User unbanned successfully"), at();
      } catch {
        H("Failed to unban user");
      }
  }, ra = async () => {
    try {
      const w = await G.inviteUser({
        email: ue.email,
        name: ue.name || void 0,
        role: ue.role || void 0,
        expiresInDays: ue.expiresInDays
      });
      _t({ token: w.token, inviteLink: w.inviteLink }), be("User invitation created successfully"), St();
    } catch (w) {
      H(w instanceof Error ? w.message : "Failed to invite user");
    }
  }, na = () => {
    je && (navigator.clipboard.writeText(je.inviteLink), be("Invite link copied to clipboard"));
  }, Hr = () => {
    Ge(!1), Pe({ email: "", name: "", role: "", expiresInDays: 7 }), _t(null);
  }, Gr = async () => {
    if (!rt.trim()) {
      ge("Please enter an email address");
      return;
    }
    Ke(!0), ge(null), Ne(null);
    try {
      const w = await G.getEntitlements(rt);
      Ne(w);
    } catch (w) {
      ge(w instanceof Error ? w.message : "Failed to lookup entitlements");
    } finally {
      Ke(!1);
    }
  }, aa = async () => {
    if (q) {
      k(!0);
      try {
        const w = await G.refreshEntitlements(rt);
        Ne(w);
      } catch {
        ge("Failed to refresh entitlements");
      } finally {
        k(!1);
      }
    }
  }, oa = async () => {
    if (!(!wt || !q)) {
      Fr(!0);
      try {
        await G.grantEntitlement(q.identifier, wt), be(`Entitlement "${wt}" granted`), _r("");
        const w = await G.refreshEntitlements(q.identifier);
        Ne(w), T((J) => ({
          ...J,
          [q.identifier]: w.entitlements.length
        }));
      } catch (w) {
        H(w instanceof Error ? w.message : "Failed to grant entitlement");
      } finally {
        Fr(!1);
      }
    }
  }, ia = async (w) => {
    if (q && confirm(`Revoke "${w}" from ${q.identifier}?`))
      try {
        await G.revokeEntitlement(q.identifier, w), be(`Entitlement "${w}" revoked`);
        const J = await G.refreshEntitlements(q.identifier);
        Ne(J), T((It) => ({
          ...It,
          [q.identifier]: J.entitlements.length
        }));
      } catch (J) {
        H(J instanceof Error ? J.message : "Failed to revoke entitlement");
      }
  }, Kr = (w) => {
    w && (nt(w), Ke(!0), ge(null), Ne(null), G.getEntitlements(w).then(Ne).catch((J) => ge(J instanceof Error ? J.message : "Failed to lookup entitlements")).finally(() => Ke(!1))), bt(!0);
  }, ot = (w) => w ? new Date(w).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }) : "Never", mr = xe.filter(
    (w) => !(q != null && q.entitlements.includes(w.name))
  ), kt = [];
  return i.users && kt.push({ label: "Users", count: S }), i.bans && kt.push({ label: "Banned", count: M }), i.users && kt.push({ label: "Invitations", count: P }), c ? /* @__PURE__ */ d(f, { children: [
    /* @__PURE__ */ d(f, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }, children: [
      /* @__PURE__ */ d(f, { children: [
        /* @__PURE__ */ t(j, { variant: "h4", content: e, customColor: "var(--theme-text-primary)" }),
        /* @__PURE__ */ t(j, { variant: "body2", content: r, customColor: "var(--theme-text-secondary)" })
      ] }),
      /* @__PURE__ */ d(f, { sx: { display: "flex", gap: 1 }, children: [
        a,
        i.users && /* @__PURE__ */ t(
          oe,
          {
            variant: "primary",
            icon: "person_add",
            label: "Invite User",
            onClick: () => Ge(!0)
          }
        ),
        i.entitlements && /* @__PURE__ */ t(
          oe,
          {
            variant: "outlined",
            icon: "person_search",
            label: "Lookup Entitlements",
            onClick: () => Kr()
          }
        ),
        i.bans && /* @__PURE__ */ t(
          oe,
          {
            variant: "outlined",
            color: "error",
            icon: "block",
            label: "Ban User",
            onClick: () => pe(!0)
          }
        )
      ] })
    ] }),
    B && /* @__PURE__ */ t(Yt, { sx: { mb: 2 } }),
    ne && /* @__PURE__ */ t(ee, { severity: "error", onClose: () => H(null), sx: { mb: 2 }, children: ne }),
    fe && /* @__PURE__ */ t(ee, { severity: "success", onClose: () => be(null), sx: { mb: 2 }, children: fe }),
    i.users && /* @__PURE__ */ d(Xt, { columns: i.bans ? 3 : 2, spacing: "medium", sx: { mb: 3 }, equalHeight: !0, children: [
      /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ d(f, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        /* @__PURE__ */ t(Xn, { sx: { fontSize: 40, color: "var(--theme-primary)" } }),
        /* @__PURE__ */ d(f, { children: [
          /* @__PURE__ */ t(j, { variant: "h4", content: S.toLocaleString(), customColor: "var(--theme-text-primary)" }),
          /* @__PURE__ */ t(j, { variant: "body2", content: "Total Users", customColor: "var(--theme-text-secondary)" })
        ] })
      ] }) }) }),
      i.entitlements && /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ d(f, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        /* @__PURE__ */ t(Mt, { sx: { fontSize: 40, color: "var(--theme-success)" } }),
        /* @__PURE__ */ d(f, { children: [
          /* @__PURE__ */ t(j, { variant: "body1", fontWeight: "500", content: "Entitlements", customColor: "var(--theme-text-primary)" }),
          /* @__PURE__ */ t(
            j,
            {
              variant: "body2",
              content: i.entitlementsReadonly ? "Read-only Mode" : "Plugin Active",
              customColor: i.entitlementsReadonly ? "var(--theme-warning)" : "var(--theme-success)"
            }
          )
        ] })
      ] }) }) }),
      i.bans && /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ d(f, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        /* @__PURE__ */ t(Lr, { sx: { fontSize: 40, color: M > 0 ? "var(--theme-error)" : "var(--theme-text-secondary)" } }),
        /* @__PURE__ */ d(f, { children: [
          /* @__PURE__ */ t(j, { variant: "h4", content: M.toString(), customColor: M > 0 ? "var(--theme-error)" : "var(--theme-text-primary)" }),
          /* @__PURE__ */ t(j, { variant: "body2", content: "Banned Users", customColor: "var(--theme-text-secondary)" })
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ d(_, { sx: { bgcolor: "var(--theme-surface)" }, children: [
      kt.length > 1 && /* @__PURE__ */ t(
        $a,
        {
          value: u,
          onChange: (w, J) => m(J),
          sx: { borderBottom: 1, borderColor: "var(--theme-border)", px: 2 },
          children: kt.map((w, J) => /* @__PURE__ */ t(Aa, { label: `${w.label}${w.count !== void 0 ? ` (${w.count})` : ""}` }, J))
        }
      ),
      /* @__PURE__ */ d(W, { sx: { p: 0 }, children: [
        /* @__PURE__ */ t(f, { sx: { p: 2, borderBottom: 1, borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(
          F,
          {
            size: "small",
            placeholder: "Search by email or name...",
            value: $,
            onChange: (w) => g(w.target.value),
            InputProps: {
              startAdornment: /* @__PURE__ */ t(Ht, { position: "start", children: /* @__PURE__ */ t(jr, { sx: { color: "var(--theme-text-secondary)" } }) })
            },
            sx: { minWidth: 300 }
          }
        ) }),
        u === 0 && i.users && /* @__PURE__ */ d(Ue, { children: [
          /* @__PURE__ */ t(Qe, { children: /* @__PURE__ */ d(Ye, { children: [
            /* @__PURE__ */ t(Xe, { children: /* @__PURE__ */ d(me, { children: [
              /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "ID" }),
              /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Name" }),
              /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Email" }),
              i.entitlements && /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, align: "center", children: "Entitlements" }),
              /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Created" }),
              /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, align: "right", children: "Actions" })
            ] }) }),
            /* @__PURE__ */ d(Ze, { children: [
              p.map((w) => /* @__PURE__ */ d(
                me,
                {
                  hover: !0,
                  sx: { cursor: o ? "pointer" : "default" },
                  onClick: () => o == null ? void 0 : o(w),
                  children: [
                    /* @__PURE__ */ d(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", fontFamily: "monospace", fontSize: "0.75rem" }, children: [
                      w.id.substring(0, 8),
                      "..."
                    ] }),
                    /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(j, { variant: "body1", content: w.name || "--", fontWeight: "500" }) }),
                    /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)" }, children: w.email }),
                    i.entitlements && /* @__PURE__ */ t(N, { sx: { borderColor: "var(--theme-border)" }, align: "center", children: /* @__PURE__ */ t(
                      te,
                      {
                        size: "small",
                        icon: /* @__PURE__ */ t(Mt, { sx: { fontSize: 14 } }),
                        label: z[w.email] ?? "...",
                        sx: {
                          bgcolor: "var(--theme-primary)20",
                          color: "var(--theme-primary)"
                        }
                      }
                    ) }),
                    /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: ot(w.created_at) }),
                    /* @__PURE__ */ t(N, { sx: { borderColor: "var(--theme-border)" }, align: "right", children: i.entitlements && /* @__PURE__ */ t(Se, { title: "View entitlements", children: /* @__PURE__ */ t($e, { size: "small", onClick: (J) => {
                      J.stopPropagation(), Kr(w.email);
                    }, children: /* @__PURE__ */ t(Mt, { fontSize: "small" }) }) }) })
                  ]
                },
                w.id
              )),
              p.length === 0 && !B && /* @__PURE__ */ t(me, { children: /* @__PURE__ */ t(N, { colSpan: i.entitlements ? 6 : 5, align: "center", sx: { py: 4, color: "var(--theme-text-secondary)" }, children: $ ? "No users match your search" : "No users found" }) })
            ] })
          ] }) }),
          /* @__PURE__ */ t(
            Ta,
            {
              component: "div",
              count: S,
              page: A,
              onPageChange: (w, J) => E(J),
              rowsPerPage: R,
              onRowsPerPageChange: (w) => {
                O(parseInt(w.target.value, 10)), E(0);
              },
              rowsPerPageOptions: [10, 25, 50, 100],
              sx: { borderTop: 1, borderColor: "var(--theme-border)" }
            }
          )
        ] }),
        u === 1 && i.bans && /* @__PURE__ */ t(Qe, { children: /* @__PURE__ */ d(Ye, { children: [
          /* @__PURE__ */ t(Xe, { children: /* @__PURE__ */ d(me, { children: [
            /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Email" }),
            /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Reason" }),
            /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Banned At" }),
            /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Expires" }),
            /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Banned By" }),
            /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, align: "right", children: "Actions" })
          ] }) }),
          /* @__PURE__ */ d(Ze, { children: [
            V.map((w) => /* @__PURE__ */ d(me, { children: [
              /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(j, { variant: "body1", content: w.email, fontWeight: "500" }) }),
              /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", maxWidth: 200 }, children: /* @__PURE__ */ t(j, { variant: "body2", content: w.reason, noWrap: !0 }) }),
              /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: ot(w.banned_at) }),
              /* @__PURE__ */ t(N, { sx: { borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(
                te,
                {
                  size: "small",
                  label: w.expires_at ? ot(w.expires_at) : "Permanent",
                  sx: {
                    bgcolor: w.expires_at ? "var(--theme-warning)20" : "var(--theme-error)20",
                    color: w.expires_at ? "var(--theme-warning)" : "var(--theme-error)"
                  }
                }
              ) }),
              /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: w.banned_by }),
              /* @__PURE__ */ t(N, { sx: { borderColor: "var(--theme-border)" }, align: "right", children: /* @__PURE__ */ t(
                oe,
                {
                  buttonSize: "small",
                  variant: "text",
                  color: "success",
                  icon: "check_circle",
                  label: "Unban",
                  onClick: () => ta(w.email)
                }
              ) })
            ] }, w.id)),
            V.length === 0 && !B && /* @__PURE__ */ t(me, { children: /* @__PURE__ */ t(N, { colSpan: 6, align: "center", sx: { py: 4, color: "var(--theme-text-secondary)" }, children: "No users are currently banned" }) })
          ] })
        ] }) }),
        u === 2 && i.users && /* @__PURE__ */ t(Qe, { children: /* @__PURE__ */ d(Ye, { children: [
          /* @__PURE__ */ t(Xe, { children: /* @__PURE__ */ d(me, { children: [
            /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Email" }),
            /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Name" }),
            /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Created" }),
            /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Expires" }),
            /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Status" })
          ] }) }),
          /* @__PURE__ */ d(Ze, { children: [
            K.map((w) => {
              const J = w.invitation_expires_at && new Date(w.invitation_expires_at) < /* @__PURE__ */ new Date();
              return /* @__PURE__ */ d(me, { children: [
                /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(j, { variant: "body1", content: w.email, fontWeight: "500" }) }),
                /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)" }, children: w.name || "--" }),
                /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: ot(w.created_at) }),
                /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: ot(w.invitation_expires_at) }),
                /* @__PURE__ */ t(N, { sx: { borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(
                  te,
                  {
                    size: "small",
                    label: J ? "Expired" : "Pending",
                    sx: {
                      bgcolor: J ? "var(--theme-error)20" : "var(--theme-warning)20",
                      color: J ? "var(--theme-error)" : "var(--theme-warning)"
                    }
                  }
                ) })
              ] }, w.id);
            }),
            K.length === 0 && !B && /* @__PURE__ */ t(me, { children: /* @__PURE__ */ t(N, { colSpan: 5, align: "center", sx: { py: 4, color: "var(--theme-text-secondary)" }, children: "No pending invitations" }) })
          ] })
        ] }) })
      ] })
    ] }),
    i.users && /* @__PURE__ */ d(
      ht,
      {
        open: Oe,
        onClose: Hr,
        maxWidth: "sm",
        fullWidth: !0,
        children: [
          /* @__PURE__ */ t(ut, { children: "Invite User" }),
          /* @__PURE__ */ t(mt, { children: je ? /* @__PURE__ */ d(f, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [
            /* @__PURE__ */ t(ee, { severity: "success", children: "Invitation created successfully! Share this link with the user:" }),
            /* @__PURE__ */ t(
              F,
              {
                label: "Invitation Link",
                fullWidth: !0,
                value: je.inviteLink,
                InputProps: {
                  readOnly: !0,
                  endAdornment: /* @__PURE__ */ t(Ht, { position: "end", children: /* @__PURE__ */ t(Se, { title: "Copy to clipboard", children: /* @__PURE__ */ t($e, { onClick: na, edge: "end", children: /* @__PURE__ */ t(Wr, {}) }) }) })
                },
                helperText: "Click the icon to copy the link to clipboard"
              }
            ),
            /* @__PURE__ */ t(ee, { severity: "info", children: "The user will need to visit this link to activate their account." })
          ] }) : /* @__PURE__ */ d(f, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [
            /* @__PURE__ */ t(
              F,
              {
                label: "Email",
                fullWidth: !0,
                required: !0,
                value: ue.email,
                onChange: (w) => Pe({ ...ue, email: w.target.value }),
                placeholder: "user@example.com",
                type: "email"
              }
            ),
            /* @__PURE__ */ t(
              F,
              {
                label: "Name (Optional)",
                fullWidth: !0,
                value: ue.name,
                onChange: (w) => Pe({ ...ue, name: w.target.value }),
                placeholder: "Enter user's full name"
              }
            ),
            /* @__PURE__ */ t(
              F,
              {
                label: "Role (Optional)",
                fullWidth: !0,
                value: ue.role,
                onChange: (w) => Pe({ ...ue, role: w.target.value }),
                placeholder: "e.g., admin, editor, viewer",
                helperText: "Stored in user metadata for your app to use"
              }
            ),
            /* @__PURE__ */ t(
              F,
              {
                label: "Invitation Expiry",
                type: "number",
                fullWidth: !0,
                value: ue.expiresInDays,
                onChange: (w) => Pe({ ...ue, expiresInDays: parseInt(w.target.value) || 7 }),
                InputProps: {
                  endAdornment: /* @__PURE__ */ t(Ht, { position: "end", children: "days" })
                },
                helperText: "How many days until the invitation expires"
              }
            )
          ] }) }),
          /* @__PURE__ */ d(ft, { children: [
            /* @__PURE__ */ t(
              oe,
              {
                variant: "text",
                label: "Close",
                onClick: Hr
              }
            ),
            !je && /* @__PURE__ */ t(
              oe,
              {
                variant: "primary",
                label: "Create Invitation",
                onClick: ra,
                disabled: !ue.email
              }
            )
          ] })
        ]
      }
    ),
    i.bans && /* @__PURE__ */ d(
      ht,
      {
        open: yt,
        onClose: () => pe(!1),
        maxWidth: "sm",
        fullWidth: !0,
        children: [
          /* @__PURE__ */ t(ut, { children: "Ban User" }),
          /* @__PURE__ */ t(mt, { children: /* @__PURE__ */ d(f, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [
            /* @__PURE__ */ t(
              F,
              {
                label: "Email",
                fullWidth: !0,
                value: he.email,
                onChange: (w) => D({ ...he, email: w.target.value }),
                placeholder: "Enter user email"
              }
            ),
            /* @__PURE__ */ t(
              F,
              {
                label: "Reason",
                fullWidth: !0,
                multiline: !0,
                rows: 3,
                value: he.reason,
                onChange: (w) => D({ ...he, reason: w.target.value }),
                placeholder: "Enter reason for ban"
              }
            ),
            /* @__PURE__ */ t(
              F,
              {
                label: "Expiration (Optional)",
                type: "datetime-local",
                fullWidth: !0,
                value: he.expiresAt,
                onChange: (w) => D({ ...he, expiresAt: w.target.value }),
                InputLabelProps: { shrink: !0 },
                helperText: "Leave empty for permanent ban"
              }
            )
          ] }) }),
          /* @__PURE__ */ d(ft, { children: [
            /* @__PURE__ */ t(
              oe,
              {
                variant: "text",
                label: "Cancel",
                onClick: () => {
                  pe(!1), D({ email: "", reason: "", expiresAt: "" });
                }
              }
            ),
            /* @__PURE__ */ t(
              oe,
              {
                variant: "primary",
                color: "error",
                label: "Ban User",
                onClick: ea,
                disabled: !he.email || !he.reason
              }
            )
          ] })
        ]
      }
    ),
    i.entitlements && /* @__PURE__ */ d(
      ht,
      {
        open: ur,
        onClose: () => bt(!1),
        maxWidth: "md",
        fullWidth: !0,
        children: [
          /* @__PURE__ */ t(ut, { children: "User Entitlements" }),
          /* @__PURE__ */ t(mt, { children: /* @__PURE__ */ d(f, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [
            /* @__PURE__ */ d(f, { sx: { display: "flex", gap: 1 }, children: [
              /* @__PURE__ */ t(
                F,
                {
                  label: "Email",
                  fullWidth: !0,
                  value: rt,
                  onChange: (w) => nt(w.target.value),
                  placeholder: "Enter user email",
                  onKeyDown: (w) => w.key === "Enter" && Gr()
                }
              ),
              /* @__PURE__ */ t(
                oe,
                {
                  variant: "primary",
                  icon: "search",
                  label: "Lookup",
                  onClick: Gr,
                  disabled: vt
                }
              )
            ] }),
            vt && /* @__PURE__ */ t(f, { sx: { display: "flex", justifyContent: "center", py: 4 }, children: /* @__PURE__ */ t(le, {}) }),
            Ct && /* @__PURE__ */ t(ee, { severity: "error", children: Ct }),
            q && /* @__PURE__ */ d(f, { children: [
              /* @__PURE__ */ d(f, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }, children: [
                /* @__PURE__ */ d(f, { children: [
                  /* @__PURE__ */ t(j, { variant: "h6", content: q.identifier, customColor: "var(--theme-text-primary)" }),
                  /* @__PURE__ */ t(j, { variant: "body2", content: `Source: ${q.source}`, customColor: "var(--theme-text-secondary)" })
                ] }),
                /* @__PURE__ */ t(
                  oe,
                  {
                    variant: "outlined",
                    icon: "refresh",
                    label: xt ? "Refreshing..." : "Refresh",
                    onClick: aa,
                    disabled: xt,
                    buttonSize: "small"
                  }
                )
              ] }),
              !i.entitlementsReadonly && mr.length > 0 && /* @__PURE__ */ d(f, { sx: { display: "flex", gap: 1, mb: 2, p: 2, bgcolor: "var(--theme-background)", borderRadius: 1 }, children: [
                /* @__PURE__ */ t(
                  Pa,
                  {
                    size: "small",
                    options: mr,
                    getOptionLabel: (w) => w.name,
                    value: mr.find((w) => w.name === wt) || null,
                    onChange: (w, J) => _r((J == null ? void 0 : J.name) || ""),
                    renderInput: (w) => /* @__PURE__ */ t(F, { ...w, label: "Grant Entitlement", placeholder: "Select entitlement" }),
                    sx: { flex: 1 }
                  }
                ),
                /* @__PURE__ */ t(
                  oe,
                  {
                    variant: "primary",
                    icon: "add",
                    label: "Grant",
                    onClick: oa,
                    disabled: !wt || Zn,
                    buttonSize: "small"
                  }
                )
              ] }),
              /* @__PURE__ */ t(j, { variant: "subtitle2", content: "Current Entitlements", customColor: "var(--theme-text-secondary)", style: { marginBottom: "8px" } }),
              q.entitlements.length === 0 ? /* @__PURE__ */ t(j, { variant: "body2", content: "No entitlements found", customColor: "var(--theme-text-secondary)" }) : /* @__PURE__ */ t(f, { sx: { display: "flex", flexWrap: "wrap", gap: 1 }, children: q.entitlements.map((w, J) => /* @__PURE__ */ t(
                te,
                {
                  icon: /* @__PURE__ */ t(Be, { sx: { fontSize: 16 } }),
                  label: w,
                  onDelete: i.entitlementsReadonly ? void 0 : () => ia(w),
                  deleteIcon: /* @__PURE__ */ t(Ur, { sx: { fontSize: 16 } }),
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
                J
              )) }),
              /* @__PURE__ */ d(f, { sx: { mt: 2, pt: 2, borderTop: 1, borderColor: "var(--theme-border)" }, children: [
                /* @__PURE__ */ t(j, { variant: "caption", content: `Data from: ${q.source === "cache" ? "Cache" : "Source"}`, customColor: "var(--theme-text-secondary)" }),
                q.cachedAt && /* @__PURE__ */ t(j, { variant: "caption", content: ` | Cached: ${ot(q.cachedAt)}`, customColor: "var(--theme-text-secondary)" }),
                i.entitlementsReadonly && /* @__PURE__ */ t(j, { variant: "caption", content: " | Read-only mode (modifications disabled)", customColor: "var(--theme-warning)" })
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ t(ft, { children: /* @__PURE__ */ t(oe, { variant: "text", label: "Close", onClick: () => bt(!1) }) })
        ]
      }
    )
  ] }) : /* @__PURE__ */ t(f, { sx: { display: "flex", justifyContent: "center", py: 8 }, children: /* @__PURE__ */ t(le, {}) });
}
const kn = Q(/* @__PURE__ */ t("path", {
  d: "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2m-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2m3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1z"
}), "Lock");
function bl({
  title: e = "Entitlements",
  subtitle: r = "Manage available entitlements",
  headerActions: n
}) {
  var he;
  const [a, o] = x(null), [i, l] = x(!0), [c, h] = x([]), [u, m] = x([]), [p, C] = x(!0), [S, y] = x(null), [A, E] = x(null), [R, O] = x(""), [$, g] = x(!1), [z, T] = x(!1), [V, U] = x(!1), [M, de] = x(null), [K, s] = x({
    name: "",
    category: "",
    description: ""
  }), [P, b] = x(!1);
  re(() => {
    G.getEntitlementsStatus().then(o).catch((D) => y(D instanceof Error ? D.message : "Failed to get status")).finally(() => l(!1));
  }, []);
  const B = ye(async () => {
    C(!0);
    try {
      const D = await G.getAvailableEntitlements();
      h(D), y(null);
    } catch (D) {
      y(D instanceof Error ? D.message : "Failed to fetch entitlements");
    } finally {
      C(!1);
    }
  }, []);
  re(() => {
    B();
  }, [B]), re(() => {
    if (!R.trim())
      m(c);
    else {
      const D = R.toLowerCase();
      m(
        c.filter(
          (Oe) => {
            var Ge, ue;
            return Oe.name.toLowerCase().includes(D) || ((Ge = Oe.category) == null ? void 0 : Ge.toLowerCase().includes(D)) || ((ue = Oe.description) == null ? void 0 : ue.toLowerCase().includes(D));
          }
        )
      );
    }
  }, [c, R]);
  const L = [...new Set(c.map((D) => D.category || "Uncategorized"))], ne = async () => {
    if (!K.name.trim()) {
      y("Name is required");
      return;
    }
    b(!0);
    try {
      E(`Entitlement "${K.name}" created`), g(!1), s({ name: "", category: "", description: "" }), B();
    } catch (D) {
      y(D instanceof Error ? D.message : "Failed to create entitlement");
    } finally {
      b(!1);
    }
  }, H = async () => {
    if (M) {
      b(!0);
      try {
        E(`Entitlement "${M.name}" updated`), T(!1), de(null), B();
      } catch (D) {
        y(D instanceof Error ? D.message : "Failed to update entitlement");
      } finally {
        b(!1);
      }
    }
  }, fe = async () => {
    if (M) {
      b(!0);
      try {
        E(`Entitlement "${M.name}" deleted`), U(!1), de(null), B();
      } catch (D) {
        y(D instanceof Error ? D.message : "Failed to delete entitlement");
      } finally {
        b(!1);
      }
    }
  }, be = (D) => {
    de(D), T(!0);
  }, yt = (D) => {
    de(D), U(!0);
  }, pe = (a == null ? void 0 : a.readonly) ?? !0;
  return i ? /* @__PURE__ */ t(f, { sx: { display: "flex", justifyContent: "center", py: 8 }, children: /* @__PURE__ */ t(le, {}) }) : /* @__PURE__ */ d(f, { children: [
    /* @__PURE__ */ d(f, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }, children: [
      /* @__PURE__ */ d(f, { children: [
        /* @__PURE__ */ t(j, { variant: "h4", content: e, customColor: "var(--theme-text-primary)" }),
        /* @__PURE__ */ t(j, { variant: "body2", content: r, customColor: "var(--theme-text-secondary)" })
      ] }),
      /* @__PURE__ */ d(f, { sx: { display: "flex", gap: 1 }, children: [
        n,
        !pe && /* @__PURE__ */ t(
          oe,
          {
            variant: "primary",
            icon: "add",
            label: "Add Entitlement",
            onClick: () => g(!0)
          }
        )
      ] })
    ] }),
    p && /* @__PURE__ */ t(Yt, { sx: { mb: 2 } }),
    S && /* @__PURE__ */ t(ee, { severity: "error", onClose: () => y(null), sx: { mb: 2 }, children: S }),
    A && /* @__PURE__ */ t(ee, { severity: "success", onClose: () => E(null), sx: { mb: 2 }, children: A }),
    /* @__PURE__ */ d(Xt, { columns: 3, spacing: "medium", sx: { mb: 3 }, equalHeight: !0, children: [
      /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ d(f, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        /* @__PURE__ */ t(Mt, { sx: { fontSize: 40, color: "var(--theme-primary)" } }),
        /* @__PURE__ */ d(f, { children: [
          /* @__PURE__ */ t(j, { variant: "h4", content: c.length.toString(), customColor: "var(--theme-text-primary)" }),
          /* @__PURE__ */ t(j, { variant: "body2", content: "Total Entitlements", customColor: "var(--theme-text-secondary)" })
        ] })
      ] }) }) }),
      /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ d(f, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
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
            children: /* @__PURE__ */ t(j, { variant: "h6", content: L.length.toString(), customColor: "var(--theme-primary)" })
          }
        ),
        /* @__PURE__ */ d(f, { children: [
          /* @__PURE__ */ t(j, { variant: "body1", fontWeight: "500", content: "Categories", customColor: "var(--theme-text-primary)" }),
          /* @__PURE__ */ t(j, { variant: "body2", content: L.slice(0, 3).join(", "), customColor: "var(--theme-text-secondary)" })
        ] })
      ] }) }) }),
      /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(W, { children: /* @__PURE__ */ d(f, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        pe ? /* @__PURE__ */ t(kn, { sx: { fontSize: 40, color: "var(--theme-warning)" } }) : /* @__PURE__ */ t(Dr, { sx: { fontSize: 40, color: "var(--theme-success)" } }),
        /* @__PURE__ */ d(f, { children: [
          /* @__PURE__ */ t(
            j,
            {
              variant: "body1",
              fontWeight: "500",
              content: pe ? "Read-only" : "Editable",
              customColor: pe ? "var(--theme-warning)" : "var(--theme-success)"
            }
          ),
          /* @__PURE__ */ t(j, { variant: "body2", content: `Source: ${((he = a == null ? void 0 : a.sources[0]) == null ? void 0 : he.name) || "Unknown"}`, customColor: "var(--theme-text-secondary)" })
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ d(W, { sx: { p: 0 }, children: [
      /* @__PURE__ */ t(f, { sx: { p: 2, borderBottom: 1, borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(
        F,
        {
          size: "small",
          placeholder: "Search entitlements...",
          value: R,
          onChange: (D) => O(D.target.value),
          InputProps: {
            startAdornment: /* @__PURE__ */ t(Ht, { position: "start", children: /* @__PURE__ */ t(jr, { sx: { color: "var(--theme-text-secondary)" } }) })
          },
          sx: { minWidth: 300 }
        }
      ) }),
      /* @__PURE__ */ t(Qe, { children: /* @__PURE__ */ d(Ye, { children: [
        /* @__PURE__ */ t(Xe, { children: /* @__PURE__ */ d(me, { children: [
          /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Name" }),
          /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Category" }),
          /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Description" }),
          !pe && /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, align: "right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ d(Ze, { children: [
          u.map((D) => /* @__PURE__ */ d(me, { hover: !0, children: [
            /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ d(f, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
              /* @__PURE__ */ t(Mt, { sx: { fontSize: 18, color: "var(--theme-primary)" } }),
              /* @__PURE__ */ t(j, { variant: "body1", content: D.name, fontWeight: "500" })
            ] }) }),
            /* @__PURE__ */ t(N, { sx: { borderColor: "var(--theme-border)" }, children: D.category ? /* @__PURE__ */ t(
              te,
              {
                size: "small",
                label: D.category,
                sx: {
                  bgcolor: "var(--theme-primary)20",
                  color: "var(--theme-primary)"
                }
              }
            ) : /* @__PURE__ */ t(j, { variant: "body2", content: "--", customColor: "var(--theme-text-secondary)" }) }),
            /* @__PURE__ */ t(N, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", maxWidth: 300 }, children: D.description || "--" }),
            !pe && /* @__PURE__ */ d(N, { sx: { borderColor: "var(--theme-border)" }, align: "right", children: [
              /* @__PURE__ */ t(Se, { title: "Edit", children: /* @__PURE__ */ t($e, { size: "small", onClick: () => be(D), children: /* @__PURE__ */ t(Dr, { fontSize: "small" }) }) }),
              /* @__PURE__ */ t(Se, { title: "Delete", children: /* @__PURE__ */ t($e, { size: "small", onClick: () => yt(D), sx: { color: "var(--theme-error)" }, children: /* @__PURE__ */ t(Ur, { fontSize: "small" }) }) })
            ] })
          ] }, D.id)),
          u.length === 0 && !p && /* @__PURE__ */ t(me, { children: /* @__PURE__ */ t(N, { colSpan: pe ? 3 : 4, align: "center", sx: { py: 4, color: "var(--theme-text-secondary)" }, children: R ? "No entitlements match your search" : "No entitlements defined" }) })
        ] })
      ] }) })
    ] }) }),
    a && a.sources.length > 0 && /* @__PURE__ */ t(_, { sx: { bgcolor: "var(--theme-surface)", mt: 3 }, children: /* @__PURE__ */ d(W, { children: [
      /* @__PURE__ */ t(j, { variant: "subtitle2", content: "Entitlement Sources", customColor: "var(--theme-text-secondary)", style: { marginBottom: "12px" } }),
      /* @__PURE__ */ t(f, { sx: { display: "flex", flexDirection: "column", gap: 1 }, children: a.sources.map((D, Oe) => /* @__PURE__ */ d(f, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        /* @__PURE__ */ t(
          te,
          {
            size: "small",
            label: D.primary ? "Primary" : "Additional",
            sx: {
              bgcolor: D.primary ? "var(--theme-primary)20" : "var(--theme-text-secondary)20",
              color: D.primary ? "var(--theme-primary)" : "var(--theme-text-secondary)"
            }
          }
        ),
        /* @__PURE__ */ t(j, { variant: "body1", content: D.name, fontWeight: "500", customColor: "var(--theme-text-primary)" }),
        D.description && /* @__PURE__ */ t(j, { variant: "body2", content: `- ${D.description}`, customColor: "var(--theme-text-secondary)" }),
        D.readonly && /* @__PURE__ */ t(
          te,
          {
            size: "small",
            icon: /* @__PURE__ */ t(kn, { sx: { fontSize: 14 } }),
            label: "Read-only",
            sx: {
              bgcolor: "var(--theme-warning)20",
              color: "var(--theme-warning)"
            }
          }
        )
      ] }, Oe)) }),
      a.cacheEnabled && /* @__PURE__ */ t(f, { sx: { mt: 2, pt: 2, borderTop: 1, borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(j, { variant: "caption", content: `Caching: Enabled (TTL: ${a.cacheTtl}s)`, customColor: "var(--theme-text-secondary)" }) })
    ] }) }),
    !pe && /* @__PURE__ */ d(
      ht,
      {
        open: $,
        onClose: () => g(!1),
        maxWidth: "sm",
        fullWidth: !0,
        children: [
          /* @__PURE__ */ t(ut, { children: "Add Entitlement" }),
          /* @__PURE__ */ t(mt, { children: /* @__PURE__ */ d(f, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [
            /* @__PURE__ */ t(
              F,
              {
                label: "Name",
                fullWidth: !0,
                value: K.name,
                onChange: (D) => s({ ...K, name: D.target.value }),
                placeholder: "e.g., premium, pro, feature:analytics",
                required: !0
              }
            ),
            /* @__PURE__ */ t(
              F,
              {
                label: "Category (Optional)",
                fullWidth: !0,
                value: K.category,
                onChange: (D) => s({ ...K, category: D.target.value }),
                placeholder: "e.g., subscription, feature, access"
              }
            ),
            /* @__PURE__ */ t(
              F,
              {
                label: "Description (Optional)",
                fullWidth: !0,
                multiline: !0,
                rows: 2,
                value: K.description,
                onChange: (D) => s({ ...K, description: D.target.value }),
                placeholder: "Describe what this entitlement grants access to"
              }
            )
          ] }) }),
          /* @__PURE__ */ d(ft, { children: [
            /* @__PURE__ */ t(oe, { variant: "text", label: "Cancel", onClick: () => g(!1) }),
            /* @__PURE__ */ t(
              oe,
              {
                variant: "primary",
                label: "Create",
                onClick: ne,
                disabled: !K.name.trim() || P
              }
            )
          ] })
        ]
      }
    ),
    !pe && M && /* @__PURE__ */ d(
      ht,
      {
        open: z,
        onClose: () => T(!1),
        maxWidth: "sm",
        fullWidth: !0,
        children: [
          /* @__PURE__ */ t(ut, { children: "Edit Entitlement" }),
          /* @__PURE__ */ t(mt, { children: /* @__PURE__ */ d(f, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [
            /* @__PURE__ */ t(
              F,
              {
                label: "Name",
                fullWidth: !0,
                value: M.name,
                disabled: !0,
                helperText: "Name cannot be changed"
              }
            ),
            /* @__PURE__ */ t(
              F,
              {
                label: "Category",
                fullWidth: !0,
                value: M.category || "",
                onChange: (D) => de({ ...M, category: D.target.value })
              }
            ),
            /* @__PURE__ */ t(
              F,
              {
                label: "Description",
                fullWidth: !0,
                multiline: !0,
                rows: 2,
                value: M.description || "",
                onChange: (D) => de({ ...M, description: D.target.value })
              }
            )
          ] }) }),
          /* @__PURE__ */ d(ft, { children: [
            /* @__PURE__ */ t(oe, { variant: "text", label: "Cancel", onClick: () => T(!1) }),
            /* @__PURE__ */ t(
              oe,
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
    !pe && M && /* @__PURE__ */ d(
      ht,
      {
        open: V,
        onClose: () => U(!1),
        maxWidth: "sm",
        fullWidth: !0,
        children: [
          /* @__PURE__ */ t(ut, { children: "Delete Entitlement" }),
          /* @__PURE__ */ d(mt, { children: [
            /* @__PURE__ */ t(
              j,
              {
                variant: "body1",
                content: `Are you sure you want to delete the entitlement "${M.name}"?`,
                customColor: "var(--theme-text-primary)"
              }
            ),
            /* @__PURE__ */ t(ee, { severity: "warning", sx: { mt: 2 }, children: "This will remove the entitlement from all users who currently have it." })
          ] }),
          /* @__PURE__ */ d(ft, { children: [
            /* @__PURE__ */ t(oe, { variant: "text", label: "Cancel", onClick: () => U(!1) }),
            /* @__PURE__ */ t(
              oe,
              {
                variant: "primary",
                color: "error",
                label: "Delete",
                onClick: fe,
                disabled: P
              }
            )
          ] })
        ]
      }
    )
  ] });
}
function vl({
  token: e,
  title: r = "Accept Invitation",
  subtitle: n = "Activate your account",
  successMessage: a = "Your account has been activated successfully!",
  redirectUrl: o,
  redirectLabel: i = "Go to App",
  onSuccess: l,
  onError: c
}) {
  const [h, u] = x(!0), [m, p] = x(null), [C, S] = x(!1), [y, A] = x(null);
  re(() => {
    (async () => {
      let O = e;
      if (O || (O = new URLSearchParams(window.location.search).get("token") || ""), !O) {
        p("No invitation token provided"), u(!1), c == null || c("No invitation token provided");
        return;
      }
      try {
        const $ = await G.acceptInvitation(O);
        A($.user), S(!0), l == null || l($.user);
      } catch ($) {
        const g = $ instanceof Error ? $.message : "Failed to accept invitation";
        p(g), c == null || c(g);
      } finally {
        u(!1);
      }
    })();
  }, [e, l, c]);
  const E = () => {
    o && (window.location.href = o);
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
      children: /* @__PURE__ */ t(_, { sx: { maxWidth: 500, width: "100%", bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ d(W, { sx: { p: 4 }, children: [
        /* @__PURE__ */ d(f, { sx: { textAlign: "center", mb: 4 }, children: [
          /* @__PURE__ */ t(j, { variant: "h4", content: r, customColor: "var(--theme-text-primary)", style: { marginBottom: "8px" } }),
          /* @__PURE__ */ t(j, { variant: "body2", content: n, customColor: "var(--theme-text-secondary)" })
        ] }),
        h && /* @__PURE__ */ d(f, { sx: { display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 4 }, children: [
          /* @__PURE__ */ t(le, {}),
          /* @__PURE__ */ t(j, { variant: "body2", content: "Activating your account...", customColor: "var(--theme-text-secondary)" })
        ] }),
        m && !h && /* @__PURE__ */ d(f, { sx: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }, children: [
          /* @__PURE__ */ t(Te, { sx: { fontSize: 64, color: "var(--theme-error)" } }),
          /* @__PURE__ */ t(ee, { severity: "error", sx: { width: "100%" }, children: m }),
          /* @__PURE__ */ t(
            j,
            {
              variant: "body2",
              content: "The invitation may have expired or is invalid. Please contact support.",
              customColor: "var(--theme-text-secondary)",
              style: { textAlign: "center" }
            }
          )
        ] }),
        C && !h && /* @__PURE__ */ d(f, { sx: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }, children: [
          /* @__PURE__ */ t(Be, { sx: { fontSize: 64, color: "var(--theme-success)" } }),
          /* @__PURE__ */ t(ee, { severity: "success", sx: { width: "100%" }, children: a }),
          y && /* @__PURE__ */ d(f, { sx: { width: "100%", textAlign: "center" }, children: [
            /* @__PURE__ */ t(
              j,
              {
                variant: "body1",
                content: `Welcome, ${y.name || y.email}!`,
                customColor: "var(--theme-text-primary)",
                fontWeight: "500",
                style: { marginBottom: "4px" }
              }
            ),
            /* @__PURE__ */ t(
              j,
              {
                variant: "body2",
                content: "Your account is now active and ready to use.",
                customColor: "var(--theme-text-secondary)"
              }
            )
          ] }),
          o && /* @__PURE__ */ t(
            oe,
            {
              variant: "primary",
              label: i,
              icon: "arrow_forward",
              onClick: E,
              fullWidth: !0
            }
          )
        ] })
      ] }) })
    }
  );
}
const xl = ({
  title: e,
  icon: r,
  status: n,
  health: a,
  stats: o = [],
  actions: i = [],
  message: l,
  loading: c = !1
}) => {
  const h = n || a || "disabled", u = {
    healthy: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
    disabled: "bg-gray-400"
  }, m = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white"
  };
  return c ? /* @__PURE__ */ t("div", { className: "rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6", children: /* @__PURE__ */ d("div", { className: "animate-pulse", children: [
    /* @__PURE__ */ t("div", { className: "h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" }),
    /* @__PURE__ */ d("div", { className: "space-y-3", children: [
      /* @__PURE__ */ t("div", { className: "h-4 bg-gray-200 dark:bg-gray-700 rounded" }),
      /* @__PURE__ */ t("div", { className: "h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" })
    ] })
  ] }) }) : /* @__PURE__ */ d("div", { className: "rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6", children: [
    /* @__PURE__ */ d("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ d("div", { className: "flex items-center gap-3", children: [
        r && /* @__PURE__ */ t("div", { className: "text-2xl text-gray-600 dark:text-gray-400", children: r }),
        /* @__PURE__ */ d("div", { children: [
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
    o.length > 0 && /* @__PURE__ */ t("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4", children: o.map((p, C) => /* @__PURE__ */ t(Dt, { ...p }, C)) }),
    i.length > 0 && /* @__PURE__ */ t("div", { className: "flex flex-wrap gap-2 mt-4", children: i.map((p, C) => /* @__PURE__ */ t(
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
      C
    )) })
  ] });
}, Cl = ({
  title: e,
  description: r,
  icon: n,
  searchPlaceholder: a,
  onSearch: o,
  actions: i = [],
  filters: l,
  tabs: c,
  activeTab: h,
  onTabChange: u,
  children: m,
  loading: p = !1,
  breadcrumbs: C
}) => {
  const S = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white"
  };
  return /* @__PURE__ */ d("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
    C && C.length > 0 && /* @__PURE__ */ t("nav", { className: "mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400", children: C.map((y, A) => /* @__PURE__ */ d(da.Fragment, { children: [
      A > 0 && /* @__PURE__ */ t("span", { children: "/" }),
      y.href ? /* @__PURE__ */ t("a", { href: y.href, className: "hover:text-gray-900 dark:hover:text-gray-100", children: y.label }) : /* @__PURE__ */ t("span", { className: "text-gray-900 dark:text-gray-100 font-medium", children: y.label })
    ] }, A)) }),
    /* @__PURE__ */ t("div", { className: "mb-8", children: /* @__PURE__ */ d("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ d("div", { className: "flex items-start gap-4", children: [
        n && /* @__PURE__ */ t("div", { className: "text-4xl text-gray-600 dark:text-gray-400 mt-1", children: n }),
        /* @__PURE__ */ d("div", { children: [
          /* @__PURE__ */ t("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white", children: e }),
          r && /* @__PURE__ */ t("p", { className: "mt-2 text-gray-600 dark:text-gray-400", children: r })
        ] })
      ] }),
      i.length > 0 && /* @__PURE__ */ t("div", { className: "flex gap-2", children: i.map((y, A) => /* @__PURE__ */ d(
        "button",
        {
          onClick: y.onClick,
          className: `
                    flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
                    transition-colors
                    ${S[y.variant || "secondary"]}
                  `,
          children: [
            y.icon,
            y.label
          ]
        },
        A
      )) })
    ] }) }),
    c && c.length > 0 && /* @__PURE__ */ t("div", { className: "mb-6 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ t("nav", { className: "flex space-x-8", children: c.map((y) => /* @__PURE__ */ t(
      "button",
      {
        onClick: () => u == null ? void 0 : u(y.id),
        className: `
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${h === y.id ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"}
                `,
        children: y.label
      },
      y.id
    )) }) }),
    (o || l) && /* @__PURE__ */ d("div", { className: "mb-6 flex flex-col sm:flex-row gap-4", children: [
      o && /* @__PURE__ */ t("div", { className: "flex-1", children: /* @__PURE__ */ t(
        "input",
        {
          type: "search",
          placeholder: a || "Search...",
          onChange: (y) => o(y.target.value),
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
    /* @__PURE__ */ t("div", { className: p ? "opacity-50 pointer-events-none" : "", children: m })
  ] });
}, wl = ({
  title: e,
  description: r,
  config: n,
  schema: a,
  onSave: o,
  onReset: i,
  loading: l = !1,
  readOnly: c = !1
}) => {
  const [h, u] = x(n), [m, p] = x({}), [C, S] = x(!1), [y, A] = x(!1);
  re(() => {
    u(n);
  }, [n]);
  const E = (g, z) => g.required && (z == null || z === "") ? `${g.label} is required` : g.pattern && typeof z == "string" && !g.pattern.test(z) ? `${g.label} format is invalid` : g.validate ? g.validate(z) : null, R = (g, z) => {
    u({ ...h, [g]: z }), A(!1), m[g] && p({ ...m, [g]: "" });
  }, O = async () => {
    const g = {};
    if (a.forEach((z) => {
      const T = E(z, h[z.key]);
      T && (g[z.key] = T);
    }), Object.keys(g).length > 0) {
      p(g);
      return;
    }
    S(!0);
    try {
      await o(h), A(!0), setTimeout(() => A(!1), 3e3);
    } catch (z) {
      console.error("Failed to save config:", z);
    } finally {
      S(!1);
    }
  }, $ = (g) => {
    var U;
    const z = h[g.key], V = `
      w-full px-3 py-2 rounded-md border
      ${!!m[g.key] ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"}
      bg-white dark:bg-gray-800
      text-gray-900 dark:text-white
      focus:ring-2 focus:border-transparent
      disabled:opacity-50 disabled:cursor-not-allowed
    `;
    switch (g.type) {
      case "boolean":
        return /* @__PURE__ */ d("label", { className: "flex items-center gap-2 cursor-pointer", children: [
          /* @__PURE__ */ t(
            "input",
            {
              type: "checkbox",
              checked: !!z,
              onChange: (M) => R(g.key, M.target.checked),
              disabled: c || l,
              className: "rounded"
            }
          ),
          /* @__PURE__ */ t("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: g.description || "Enable" })
        ] });
      case "select":
        return /* @__PURE__ */ t(
          "select",
          {
            value: String(z ?? ""),
            onChange: (M) => R(g.key, M.target.value),
            disabled: c || l,
            className: V,
            children: (U = g.options) == null ? void 0 : U.map((M) => /* @__PURE__ */ t("option", { value: M.value, children: M.label }, M.value))
          }
        );
      case "textarea":
        return /* @__PURE__ */ t(
          "textarea",
          {
            value: String(z ?? ""),
            onChange: (M) => R(g.key, M.target.value),
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
            value: Number(z ?? 0),
            onChange: (M) => R(g.key, Number(M.target.value)),
            min: g.min,
            max: g.max,
            step: g.step,
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
            value: String(z ?? ""),
            onChange: (M) => R(g.key, M.target.value),
            disabled: c || l,
            className: V
          }
        );
    }
  };
  return /* @__PURE__ */ d("div", { className: "rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6", children: [
    /* @__PURE__ */ d("div", { className: "mb-6", children: [
      /* @__PURE__ */ t("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: e }),
      r && /* @__PURE__ */ t("p", { className: "mt-1 text-gray-600 dark:text-gray-400", children: r })
    ] }),
    /* @__PURE__ */ t("div", { className: "space-y-6", children: a.map((g) => /* @__PURE__ */ d("div", { children: [
      g.type !== "boolean" && /* @__PURE__ */ d("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: [
        g.label,
        g.required && /* @__PURE__ */ t("span", { className: "text-red-500 ml-1", children: "*" })
      ] }),
      $(g),
      g.description && g.type !== "boolean" && /* @__PURE__ */ t("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: g.description }),
      m[g.key] && /* @__PURE__ */ t("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: m[g.key] })
    ] }, g.key)) }),
    !c && /* @__PURE__ */ d("div", { className: "mt-6 flex items-center gap-3", children: [
      /* @__PURE__ */ t(
        "button",
        {
          onClick: O,
          disabled: C || l,
          className: `
              px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white
              rounded-md text-sm font-medium
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            `,
          children: C ? "Saving..." : "Save Changes"
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          onClick: i,
          disabled: C || l,
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
      y && /* @__PURE__ */ t("span", { className: "text-sm text-green-600 dark:text-green-400", children: "✓ Saved successfully" })
    ] })
  ] });
};
export {
  vl as AcceptInvitationPage,
  gl as ControlPanelApp,
  zs as DashboardPage,
  hs as DashboardWidgetProvider,
  us as DashboardWidgetRenderer,
  Il as DataTable,
  bl as EntitlementsPage,
  js as LogsPage,
  rl as NotFoundPage,
  wl as PluginConfigPanel,
  Cl as PluginManagementPage,
  xl as PluginStatusWidget,
  ps as PluginWidgetRenderer,
  bs as ServiceHealthWidget,
  El as StatCard,
  qs as SystemPage,
  yl as UsersPage,
  ms as WidgetComponentRegistryProvider,
  G as api,
  Ns as getBuiltInWidgetComponents,
  Qn as useDashboardWidgets,
  pl as useRegisterWidget,
  fs as useWidgetComponentRegistry
};
//# sourceMappingURL=index.js.map
