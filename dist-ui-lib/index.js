var xa = Object.defineProperty;
var Ca = (e, r, n) => r in e ? xa(e, r, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[r] = n;
var Yt = (e, r, n) => Ca(e, typeof r != "symbol" ? r + "" : r, n);
import { jsxs as s, jsx as t, Fragment as Be } from "react/jsx-runtime";
import * as Xe from "react";
import wa, { createContext as Dn, useState as f, useCallback as Se, useContext as Nn, useMemo as Sa, useEffect as ie, useRef as ka } from "react";
import { useNavigate as zn, Routes as Ea, Route as Ot } from "react-router-dom";
import { Box as m, Typography as v, CircularProgress as se, Alert as q, Card as F, CardContent as j, Chip as oe, LinearProgress as Gt, Button as re, Divider as _n, IconButton as Me, List as On, ListItem as Bn, ListItemText as Mn, Accordion as Ia, AccordionSummary as $a, Checkbox as Zr, AccordionDetails as Aa, ListItemButton as Ta, ListItemIcon as Pa, Dialog as Ze, DialogTitle as et, DialogContent as tt, Paper as Zt, DialogActions as rt, Snackbar as Rn, TableContainer as qe, Table as Je, TableHead as Qe, TableRow as be, TableCell as _, TableBody as Ye, TextField as K, FormControl as rr, InputLabel as nr, Select as ar, MenuItem as Ae, DialogContentText as Ln, CardActionArea as Da, Grid as Te, ToggleButtonGroup as Na, ToggleButton as en, Tooltip as De, Pagination as za, FormControlLabel as Bt, Switch as Mt, Collapse as _a, Link as Oa, Tabs as Ba, Tab as Ma, InputAdornment as er, TablePagination as Ra, Autocomplete as La } from "@mui/material";
import { AppConfigBuilder as Wa, Text as H, GridLayout as lr, StatCard as Wt, Button as me, QwickApp as ja, ProductLogo as Fa, Dialog as St, DialogTitle as kt, DialogContent as Et, DialogActions as It } from "@qwickapps/react-framework";
import { DataTable as Kl, StatCard as Gl } from "@qwickapps/react-framework";
import ae from "prop-types";
import Ua from "@emotion/styled";
import "@emotion/react";
import { isValidElementType as Wn, Memo as Va, ForwardRef as Ha } from "react-is";
const Ka = Wa.create().withName("Control Panel").withId("com.qwickapps.control-panel").withVersion("1.0.0").withDefaultTheme("dark").withDefaultPalette("cosmic").withThemeSwitcher(!0).withPaletteSwitcher(!0).withDisplay("standalone").build(), tn = (e) => e, Ga = () => {
  let e = tn;
  return {
    configure(r) {
      e = r;
    },
    generate(r) {
      return e(r);
    },
    reset() {
      e = tn;
    }
  };
}, qa = Ga();
function ht(e, ...r) {
  const n = new URL(`https://mui.com/production-error/?code=${e}`);
  return r.forEach((a) => n.searchParams.append("args[]", a)), `Minified MUI error #${e}; visit ${n} for the full message.`;
}
function ut(e) {
  if (typeof e != "string")
    throw new Error(process.env.NODE_ENV !== "production" ? "MUI: `capitalize(string)` expects a string argument." : ht(7));
  return e.charAt(0).toUpperCase() + e.slice(1);
}
function jn(e) {
  var r, n, a = "";
  if (typeof e == "string" || typeof e == "number") a += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var o = e.length;
    for (r = 0; r < o; r++) e[r] && (n = jn(e[r])) && (a && (a += " "), a += n);
  } else for (n in e) e[n] && (a && (a += " "), a += n);
  return a;
}
function Fn() {
  for (var e, r, n = 0, a = "", o = arguments.length; n < o; n++) (e = arguments[n]) && (r = jn(e)) && (a && (a += " "), a += r);
  return a;
}
function Ja(e, r, n = void 0) {
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
function Ve(e) {
  if (typeof e != "object" || e === null)
    return !1;
  const r = Object.getPrototypeOf(e);
  return (r === null || r === Object.prototype || Object.getPrototypeOf(r) === null) && !(Symbol.toStringTag in e) && !(Symbol.iterator in e);
}
function Un(e) {
  if (/* @__PURE__ */ Xe.isValidElement(e) || Wn(e) || !Ve(e))
    return e;
  const r = {};
  return Object.keys(e).forEach((n) => {
    r[n] = Un(e[n]);
  }), r;
}
function Ne(e, r, n = {
  clone: !0
}) {
  const a = n.clone ? {
    ...e
  } : e;
  return Ve(e) && Ve(r) && Object.keys(r).forEach((o) => {
    /* @__PURE__ */ Xe.isValidElement(r[o]) || Wn(r[o]) ? a[o] = r[o] : Ve(r[o]) && // Avoid prototype pollution
    Object.prototype.hasOwnProperty.call(e, o) && Ve(e[o]) ? a[o] = Ne(e[o], r[o], n) : n.clone ? a[o] = Ve(r[o]) ? Un(r[o]) : r[o] : a[o] = r[o];
  }), a;
}
function Ut(e, r) {
  return r ? Ne(e, r, {
    clone: !1
    // No need to clone deep, it's way faster.
  }) : e;
}
const at = process.env.NODE_ENV !== "production" ? ae.oneOfType([ae.number, ae.string, ae.object, ae.array]) : {};
function rn(e, r) {
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
function Qa(e, r) {
  return r === "@" || r.startsWith("@") && (e.some((n) => r.startsWith(`@${n}`)) || !!r.match(/^@\d/));
}
function Ya(e, r) {
  const n = r.match(/^@([^/]+)?\/?(.+)?$/);
  if (!n) {
    if (process.env.NODE_ENV !== "production")
      throw (
        /* minify-error */
        new Error(`MUI: The provided shorthand ${`(${r})`} is invalid. The format should be \`@<breakpoint | number>\` or \`@<breakpoint | number>/<container>\`.
For example, \`@sm\` or \`@600\` or \`@40rem/sidebar\`.`)
      );
    return null;
  }
  const [, a, o] = n, i = Number.isNaN(+a) ? a || 0 : +a;
  return e.containerQueries(o).up(i);
}
function Xa(e) {
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
const cr = {
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
}, nn = {
  // Sorted ASC by size. That's important.
  // It can't be configured as it's used statically for propTypes.
  keys: ["xs", "sm", "md", "lg", "xl"],
  up: (e) => `@media (min-width:${cr[e]}px)`
}, Za = {
  containerQueries: (e) => ({
    up: (r) => {
      let n = typeof r == "number" ? r : cr[r] || r;
      return typeof n == "number" && (n = `${n}px`), e ? `@container ${e} (min-width:${n})` : `@container (min-width:${n})`;
    }
  })
};
function He(e, r, n) {
  const a = e.theme || {};
  if (Array.isArray(r)) {
    const i = a.breakpoints || nn;
    return r.reduce((l, c, h) => (l[i.up(i.keys[h])] = n(r[h]), l), {});
  }
  if (typeof r == "object") {
    const i = a.breakpoints || nn;
    return Object.keys(r).reduce((l, c) => {
      if (Qa(i.keys, c)) {
        const h = Ya(a.containerQueries ? a : Za, c);
        h && (l[h] = n(r[c], c));
      } else if (Object.keys(i.values || cr).includes(c)) {
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
function eo(e = {}) {
  var n;
  return ((n = e.keys) == null ? void 0 : n.reduce((a, o) => {
    const i = e.up(o);
    return a[i] = {}, a;
  }, {})) || {};
}
function an(e, r) {
  return e.reduce((n, a) => {
    const o = n[a];
    return (!o || Object.keys(o).length === 0) && delete n[a], n;
  }, r);
}
function dr(e, r, n = !0) {
  if (!r || typeof r != "string")
    return null;
  if (e && e.vars && n) {
    const a = `vars.${r}`.split(".").reduce((o, i) => o && o[i] ? o[i] : null, e);
    if (a != null)
      return a;
  }
  return r.split(".").reduce((a, o) => a && a[o] != null ? a[o] : null, e);
}
function or(e, r, n, a = n) {
  let o;
  return typeof e == "function" ? o = e(n) : Array.isArray(e) ? o = e[n] || a : o = dr(e, n) || a, r && (o = r(o, a, e)), o;
}
function ge(e) {
  const {
    prop: r,
    cssProperty: n = e.prop,
    themeKey: a,
    transform: o
  } = e, i = (l) => {
    if (l[r] == null)
      return null;
    const c = l[r], h = l.theme, u = dr(h, a) || {};
    return He(l, c, (g) => {
      let y = or(u, o, g);
      return g === y && typeof g == "string" && (y = or(u, o, `${r}${g === "default" ? "" : ut(g)}`, g)), n === !1 ? y : {
        [n]: y
      };
    });
  };
  return i.propTypes = process.env.NODE_ENV !== "production" ? {
    [r]: at
  } : {}, i.filterProps = [r], i;
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
}, on = {
  marginX: "mx",
  marginY: "my",
  paddingX: "px",
  paddingY: "py"
}, ao = to((e) => {
  if (e.length > 2)
    if (on[e])
      e = on[e];
    else
      return [e];
  const [r, n] = e.split(""), a = ro[r], o = no[n] || "";
  return Array.isArray(o) ? o.map((i) => a + i) : [a + o];
}), hr = ["m", "mt", "mr", "mb", "ml", "mx", "my", "margin", "marginTop", "marginRight", "marginBottom", "marginLeft", "marginX", "marginY", "marginInline", "marginInlineStart", "marginInlineEnd", "marginBlock", "marginBlockStart", "marginBlockEnd"], ur = ["p", "pt", "pr", "pb", "pl", "px", "py", "padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "paddingX", "paddingY", "paddingInline", "paddingInlineStart", "paddingInlineEnd", "paddingBlock", "paddingBlockStart", "paddingBlockEnd"], oo = [...hr, ...ur];
function qt(e, r, n, a) {
  const o = dr(e, r, !0) ?? n;
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
function Lr(e) {
  return qt(e, "spacing", 8, "spacing");
}
function Jt(e, r) {
  return typeof r == "string" || r == null ? r : e(r);
}
function io(e, r) {
  return (n) => e.reduce((a, o) => (a[o] = Jt(r, n), a), {});
}
function so(e, r, n, a) {
  if (!r.includes(n))
    return null;
  const o = ao(n), i = io(o, a), l = e[n];
  return He(e, l, i);
}
function Vn(e, r) {
  const n = Lr(e.theme);
  return Object.keys(e).map((a) => so(e, r, a, n)).reduce(Ut, {});
}
function fe(e) {
  return Vn(e, hr);
}
fe.propTypes = process.env.NODE_ENV !== "production" ? hr.reduce((e, r) => (e[r] = at, e), {}) : {};
fe.filterProps = hr;
function pe(e) {
  return Vn(e, ur);
}
pe.propTypes = process.env.NODE_ENV !== "production" ? ur.reduce((e, r) => (e[r] = at, e), {}) : {};
pe.filterProps = ur;
process.env.NODE_ENV !== "production" && oo.reduce((e, r) => (e[r] = at, e), {});
function mr(...e) {
  const r = e.reduce((a, o) => (o.filterProps.forEach((i) => {
    a[i] = o;
  }), a), {}), n = (a) => Object.keys(a).reduce((o, i) => r[i] ? Ut(o, r[i](a)) : o, {});
  return n.propTypes = process.env.NODE_ENV !== "production" ? e.reduce((a, o) => Object.assign(a, o.propTypes), {}) : {}, n.filterProps = e.reduce((a, o) => a.concat(o.filterProps), []), n;
}
function Oe(e) {
  return typeof e != "number" ? e : `${e}px solid`;
}
function Re(e, r) {
  return ge({
    prop: e,
    themeKey: "borders",
    transform: r
  });
}
const lo = Re("border", Oe), co = Re("borderTop", Oe), ho = Re("borderRight", Oe), uo = Re("borderBottom", Oe), mo = Re("borderLeft", Oe), fo = Re("borderColor"), po = Re("borderTopColor"), go = Re("borderRightColor"), yo = Re("borderBottomColor"), bo = Re("borderLeftColor"), vo = Re("outline", Oe), xo = Re("outlineColor"), fr = (e) => {
  if (e.borderRadius !== void 0 && e.borderRadius !== null) {
    const r = qt(e.theme, "shape.borderRadius", 4, "borderRadius"), n = (a) => ({
      borderRadius: Jt(r, a)
    });
    return He(e, e.borderRadius, n);
  }
  return null;
};
fr.propTypes = process.env.NODE_ENV !== "production" ? {
  borderRadius: at
} : {};
fr.filterProps = ["borderRadius"];
mr(lo, co, ho, uo, mo, fo, po, go, yo, bo, fr, vo, xo);
const pr = (e) => {
  if (e.gap !== void 0 && e.gap !== null) {
    const r = qt(e.theme, "spacing", 8, "gap"), n = (a) => ({
      gap: Jt(r, a)
    });
    return He(e, e.gap, n);
  }
  return null;
};
pr.propTypes = process.env.NODE_ENV !== "production" ? {
  gap: at
} : {};
pr.filterProps = ["gap"];
const gr = (e) => {
  if (e.columnGap !== void 0 && e.columnGap !== null) {
    const r = qt(e.theme, "spacing", 8, "columnGap"), n = (a) => ({
      columnGap: Jt(r, a)
    });
    return He(e, e.columnGap, n);
  }
  return null;
};
gr.propTypes = process.env.NODE_ENV !== "production" ? {
  columnGap: at
} : {};
gr.filterProps = ["columnGap"];
const yr = (e) => {
  if (e.rowGap !== void 0 && e.rowGap !== null) {
    const r = qt(e.theme, "spacing", 8, "rowGap"), n = (a) => ({
      rowGap: Jt(r, a)
    });
    return He(e, e.rowGap, n);
  }
  return null;
};
yr.propTypes = process.env.NODE_ENV !== "production" ? {
  rowGap: at
} : {};
yr.filterProps = ["rowGap"];
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
mr(pr, gr, yr, Co, wo, So, ko, Eo, Io, $o, Ao, To);
function $t(e, r) {
  return r === "grey" ? r : e;
}
const Po = ge({
  prop: "color",
  themeKey: "palette",
  transform: $t
}), Do = ge({
  prop: "bgcolor",
  cssProperty: "backgroundColor",
  themeKey: "palette",
  transform: $t
}), No = ge({
  prop: "backgroundColor",
  themeKey: "palette",
  transform: $t
});
mr(Po, Do, No);
function Pe(e) {
  return e <= 1 && e !== 0 ? `${e * 100}%` : e;
}
const zo = ge({
  prop: "width",
  transform: Pe
}), Wr = (e) => {
  if (e.maxWidth !== void 0 && e.maxWidth !== null) {
    const r = (n) => {
      var o, i, l, c, h;
      const a = ((l = (i = (o = e.theme) == null ? void 0 : o.breakpoints) == null ? void 0 : i.values) == null ? void 0 : l[n]) || cr[n];
      return a ? ((h = (c = e.theme) == null ? void 0 : c.breakpoints) == null ? void 0 : h.unit) !== "px" ? {
        maxWidth: `${a}${e.theme.breakpoints.unit}`
      } : {
        maxWidth: a
      } : {
        maxWidth: Pe(n)
      };
    };
    return He(e, e.maxWidth, r);
  }
  return null;
};
Wr.filterProps = ["maxWidth"];
const _o = ge({
  prop: "minWidth",
  transform: Pe
}), Oo = ge({
  prop: "height",
  transform: Pe
}), Bo = ge({
  prop: "maxHeight",
  transform: Pe
}), Mo = ge({
  prop: "minHeight",
  transform: Pe
});
ge({
  prop: "size",
  cssProperty: "width",
  transform: Pe
});
ge({
  prop: "size",
  cssProperty: "height",
  transform: Pe
});
const Ro = ge({
  prop: "boxSizing"
});
mr(zo, Wr, _o, Oo, Bo, Mo, Ro);
const br = {
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
    style: fr
  },
  // palette
  color: {
    themeKey: "palette",
    transform: $t
  },
  bgcolor: {
    themeKey: "palette",
    cssProperty: "backgroundColor",
    transform: $t
  },
  backgroundColor: {
    themeKey: "palette",
    transform: $t
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
    style: pr
  },
  rowGap: {
    style: yr
  },
  columnGap: {
    style: gr
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
    transform: Pe
  },
  maxWidth: {
    style: Wr
  },
  minWidth: {
    transform: Pe
  },
  height: {
    transform: Pe
  },
  maxHeight: {
    transform: Pe
  },
  minHeight: {
    transform: Pe
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
      transform: p,
      style: g
    } = c;
    if (a == null)
      return null;
    if (u === "typography" && a === "inherit")
      return {
        [n]: a
      };
    const y = dr(o, u) || {};
    return g ? g(l) : He(l, a, (x) => {
      let T = or(y, p, x);
      return x === T && typeof x == "string" && (T = or(y, p, `${n}${x === "default" ? "" : ut(x)}`, x)), h === !1 ? T : {
        [h]: T
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
    const l = o.unstable_sxConfig ?? br;
    function c(h) {
      let u = h;
      if (typeof h == "function")
        u = h(o);
      else if (typeof h != "object")
        return h;
      if (!u)
        return null;
      const p = eo(o.breakpoints), g = Object.keys(p);
      let y = p;
      return Object.keys(u).forEach((w) => {
        const x = Wo(u[w], o);
        if (x != null)
          if (typeof x == "object")
            if (l[w])
              y = Ut(y, e(w, x, o, l));
            else {
              const T = He({
                theme: o
              }, x, ($) => ({
                [w]: $
              }));
              Lo(T, x) ? y[w] = r({
                sx: x,
                theme: o,
                nested: !0
              }) : y = Ut(y, T);
            }
          else
            y = Ut(y, e(w, x, o, l));
      }), !i && o.modularCssLayers ? {
        "@layer sx": rn(o, an(g, y))
      } : rn(o, an(g, y));
    }
    return Array.isArray(a) ? a.map(c) : c(a);
  }
  return r;
}
const At = jo();
At.filterProps = ["sx"];
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
var Ho = /[A-Z]|^ms/g, Ko = /_EMO_([^_]+?)_([^]*?)_EMO_/g, Hn = function(r) {
  return r.charCodeAt(1) === 45;
}, sn = function(r) {
  return r != null && typeof r != "boolean";
}, Sr = /* @__PURE__ */ Vo(function(e) {
  return Hn(e) ? e : e.replace(Ho, "-$&").toLowerCase();
}), ln = function(r, n) {
  switch (r) {
    case "animation":
    case "animationName":
      if (typeof n == "string")
        return n.replace(Ko, function(a, o, i) {
          return Ge = {
            name: o,
            styles: i,
            next: Ge
          }, o;
        });
  }
  return Uo[r] !== 1 && !Hn(r) && typeof n == "number" && n !== 0 ? n + "px" : n;
};
function ir(e, r, n) {
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
      var i = n;
      if (i.styles !== void 0) {
        var l = i.next;
        if (l !== void 0)
          for (; l !== void 0; )
            Ge = {
              name: l.name,
              styles: l.styles,
              next: Ge
            }, l = l.next;
        var c = i.styles + ";";
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
      a += ir(e, r, n[o]) + ";";
  else
    for (var i in n) {
      var l = n[i];
      if (typeof l != "object") {
        var c = l;
        sn(c) && (a += Sr(i) + ":" + ln(i, c) + ";");
      } else if (Array.isArray(l) && typeof l[0] == "string" && r == null)
        for (var h = 0; h < l.length; h++)
          sn(l[h]) && (a += Sr(i) + ":" + ln(i, l[h]) + ";");
      else {
        var u = ir(e, r, l);
        switch (i) {
          case "animation":
          case "animationName": {
            a += Sr(i) + ":" + u + ";";
            break;
          }
          default:
            a += i + "{" + u + "}";
        }
      }
    }
  return a;
}
var cn = /label:\s*([^\s;{]+)\s*(;|$)/g, Ge;
function qo(e, r, n) {
  if (e.length === 1 && typeof e[0] == "object" && e[0] !== null && e[0].styles !== void 0)
    return e[0];
  var a = !0, o = "";
  Ge = void 0;
  var i = e[0];
  if (i == null || i.raw === void 0)
    a = !1, o += ir(n, r, i);
  else {
    var l = i;
    o += l[0];
  }
  for (var c = 1; c < e.length; c++)
    if (o += ir(n, r, e[c]), a) {
      var h = i;
      o += h[c];
    }
  cn.lastIndex = 0;
  for (var u = "", p; (p = cn.exec(o)) !== null; )
    u += "-" + p[1];
  var g = Fo(o) + u;
  return {
    name: g,
    styles: o,
    next: Ge
  };
}
/**
 * @mui/styled-engine v7.3.8
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
`)) : a.some((i) => i === void 0) && console.error(`MUI: the styled(${o})(...args) API requires all its args to be defined.`), n(...a);
  } : n;
}
function Qo(e, r) {
  Array.isArray(e.__emotion_styles) && (e.__emotion_styles = r(e.__emotion_styles));
}
const dn = [];
function dt(e) {
  return dn[0] = e, qo(dn);
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
  } = e, i = Yo(r), l = Object.keys(i);
  function c(y) {
    return `@media (min-width:${typeof r[y] == "number" ? r[y] : y}${n})`;
  }
  function h(y) {
    return `@media (max-width:${(typeof r[y] == "number" ? r[y] : y) - a / 100}${n})`;
  }
  function u(y, w) {
    const x = l.indexOf(w);
    return `@media (min-width:${typeof r[y] == "number" ? r[y] : y}${n}) and (max-width:${(x !== -1 && typeof r[l[x]] == "number" ? r[l[x]] : w) - a / 100}${n})`;
  }
  function p(y) {
    return l.indexOf(y) + 1 < l.length ? u(y, l[l.indexOf(y) + 1]) : c(y);
  }
  function g(y) {
    const w = l.indexOf(y);
    return w === 0 ? c(l[1]) : w === l.length - 1 ? h(l[w]) : u(y, l[l.indexOf(y) + 1]).replace("@media", "@media not all and");
  }
  return {
    keys: l,
    values: i,
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
function Kn(e = 8, r = Lr({
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
function ei(e, r) {
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
function Gn(e = {}, ...r) {
  const {
    breakpoints: n = {},
    palette: a = {},
    spacing: o,
    shape: i = {},
    ...l
  } = e, c = Xo(n), h = Kn(o);
  let u = Ne({
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
      ...i
    }
  }, l);
  return u = Xa(u), u.applyStyles = ei, u = r.reduce((p, g) => Ne(p, g), u), u.unstable_sxConfig = {
    ...br,
    ...l == null ? void 0 : l.unstable_sxConfig
  }, u.unstable_sx = function(g) {
    return At({
      sx: g,
      theme: this
    });
  }, u;
}
const ti = {
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
function jr(e, r, n = "Mui") {
  const a = ti[r];
  return a ? `${n}-${a}` : `${qa.generate(e)}-${r}`;
}
function ri(e, r, n = "Mui") {
  const a = {};
  return r.forEach((o) => {
    a[o] = jr(e, o, n);
  }), a;
}
function qn(e, r = "") {
  return e.displayName || e.name || r;
}
function hn(e, r, n) {
  const a = qn(r);
  return e.displayName || (a !== "" ? `${n}(${a})` : n);
}
function ni(e) {
  if (e != null) {
    if (typeof e == "string")
      return e;
    if (typeof e == "function")
      return qn(e, "Component");
    if (typeof e == "object")
      switch (e.$$typeof) {
        case Ha:
          return hn(e, e.render, "ForwardRef");
        case Va:
          return hn(e, e.type, "memo");
        default:
          return;
      }
  }
}
function Jn(e) {
  const {
    variants: r,
    ...n
  } = e, a = {
    variants: r,
    style: dt(n),
    isProcessed: !0
  };
  return a.style === n || r && r.forEach((o) => {
    typeof o.style != "function" && (o.style = dt(o.style));
  }), a;
}
const ai = Gn();
function kr(e) {
  return e !== "ownerState" && e !== "theme" && e !== "sx" && e !== "as";
}
function ct(e, r) {
  return r && e && typeof e == "object" && e.styles && !e.styles.startsWith("@layer") && (e.styles = `@layer ${r}{${String(e.styles)}}`), e;
}
function oi(e) {
  return e ? (r, n) => n[e] : null;
}
function ii(e, r, n) {
  e.theme = di(e.theme) ? n : e.theme[r] || e.theme;
}
function tr(e, r, n) {
  const a = typeof r == "function" ? r(e) : r;
  if (Array.isArray(a))
    return a.flatMap((o) => tr(e, o, n));
  if (Array.isArray(a == null ? void 0 : a.variants)) {
    let o;
    if (a.isProcessed)
      o = n ? ct(a.style, n) : a.style;
    else {
      const {
        variants: i,
        ...l
      } = a;
      o = n ? ct(dt(l), n) : l;
    }
    return Qn(e, a.variants, [o], n);
  }
  return a != null && a.isProcessed ? n ? ct(dt(a.style), n) : a.style : n ? ct(dt(a), n) : a;
}
function Qn(e, r, n = [], a = void 0) {
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
    }), n.push(a ? ct(dt(c.style(o)), a) : c.style(o))) : n.push(a ? ct(dt(c.style), a) : c.style);
  }
  return n;
}
function si(e = {}) {
  const {
    themeId: r,
    defaultTheme: n = ai,
    rootShouldForwardProp: a = kr,
    slotShouldForwardProp: o = kr
  } = e;
  function i(c) {
    ii(c, r, n);
  }
  return (c, h = {}) => {
    Qo(c, (D) => D.filter((U) => U !== At));
    const {
      name: u,
      slot: p,
      skipVariantsResolver: g,
      skipSx: y,
      // TODO v6: remove `lowercaseFirstLetter()` in the next major release
      // For more details: https://github.com/mui/material-ui/pull/37908
      overridesResolver: w = oi(Yn(p)),
      ...x
    } = h, T = u && u.startsWith("Mui") || p ? "components" : "custom", $ = g !== void 0 ? g : (
      // TODO v6: remove `Root` in the next major release
      // For more details: https://github.com/mui/material-ui/pull/37908
      p && p !== "Root" && p !== "root" || !1
    ), N = y || !1;
    let O = kr;
    p === "Root" || p === "root" ? O = a : p ? O = o : hi(c) && (O = void 0);
    const I = Jo(c, {
      shouldForwardProp: O,
      label: ci(u, p),
      ...x
    }), b = (D) => {
      if (D.__emotion_real === D)
        return D;
      if (typeof D == "function")
        return function(M) {
          return tr(M, D, M.theme.modularCssLayers ? T : void 0);
        };
      if (Ve(D)) {
        const U = Jn(D);
        return function(B) {
          return U.variants ? tr(B, U, B.theme.modularCssLayers ? T : void 0) : B.theme.modularCssLayers ? ct(U.style, T) : U.style;
        };
      }
      return D;
    }, k = (...D) => {
      const U = [], M = D.map(b), B = [];
      if (U.push(i), u && w && B.push(function(z) {
        var he, G;
        const R = (G = (he = z.theme.components) == null ? void 0 : he[u]) == null ? void 0 : G.styleOverrides;
        if (!R)
          return null;
        const V = {};
        for (const ve in R)
          V[ve] = tr(z, R[ve], z.theme.modularCssLayers ? "theme" : void 0);
        return w(z, V);
      }), u && !$ && B.push(function(z) {
        var V, he;
        const C = z.theme, R = (he = (V = C == null ? void 0 : C.components) == null ? void 0 : V[u]) == null ? void 0 : he.variants;
        return R ? Qn(z, R, [], z.theme.modularCssLayers ? "theme" : void 0) : null;
      }), N || B.push(At), Array.isArray(M[0])) {
        const d = M.shift(), z = new Array(U.length).fill(""), C = new Array(B.length).fill("");
        let R;
        R = [...z, ...d, ...C], R.raw = [...z, ...d.raw, ...C], U.unshift(R);
      }
      const de = [...U, ...M, ...B], L = I(...de);
      return c.muiName && (L.muiName = c.muiName), process.env.NODE_ENV !== "production" && (L.displayName = li(u, p, c)), L;
    };
    return I.withConfig && (k.withConfig = I.withConfig), k;
  };
}
function li(e, r, n) {
  return e ? `${e}${ut(r || "")}` : `Styled(${ni(n)})`;
}
function ci(e, r) {
  let n;
  return process.env.NODE_ENV !== "production" && e && (n = `${e}-${Yn(r || "Root")}`), n;
}
function di(e) {
  for (const r in e)
    return !1;
  return !0;
}
function hi(e) {
  return typeof e == "string" && // 96 is one less than the char code
  // for "a" so this is checking that
  // it's a lowercase character
  e.charCodeAt(0) > 96;
}
function Yn(e) {
  return e && e.charAt(0).toLowerCase() + e.slice(1);
}
function Dr(e, r, n = !1) {
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
              a[i][u] = Dr(l[u], c[u], n);
            }
        }
      } else i === "className" && n && r.className ? a.className = Fn(e == null ? void 0 : e.className, r == null ? void 0 : r.className) : i === "style" && n && r.style ? a.style = {
        ...e == null ? void 0 : e.style,
        ...r == null ? void 0 : r.style
      } : a[i] === void 0 && (a[i] = e[i]);
    }
  return a;
}
function ui(e, r = Number.MIN_SAFE_INTEGER, n = Number.MAX_SAFE_INTEGER) {
  return Math.max(r, Math.min(e, n));
}
function Fr(e, r = 0, n = 1) {
  return process.env.NODE_ENV !== "production" && (e < r || e > n) && console.error(`MUI: The value provided ${e} is out of range [${r}, ${n}].`), ui(e, r, n);
}
function mi(e) {
  e = e.slice(1);
  const r = new RegExp(`.{1,${e.length >= 6 ? 2 : 1}}`, "g");
  let n = e.match(r);
  return n && n[0].length === 1 && (n = n.map((a) => a + a)), process.env.NODE_ENV !== "production" && e.length !== e.trim().length && console.error(`MUI: The color: "${e}" is invalid. Make sure the color input doesn't contain leading/trailing space.`), n ? `rgb${n.length === 4 ? "a" : ""}(${n.map((a, o) => o < 3 ? parseInt(a, 16) : Math.round(parseInt(a, 16) / 255 * 1e3) / 1e3).join(", ")})` : "";
}
function nt(e) {
  if (e.type)
    return e;
  if (e.charAt(0) === "#")
    return nt(mi(e));
  const r = e.indexOf("("), n = e.substring(0, r);
  if (!["rgb", "rgba", "hsl", "hsla", "color"].includes(n))
    throw new Error(process.env.NODE_ENV !== "production" ? `MUI: Unsupported \`${e}\` color.
The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().` : ht(9, e));
  let a = e.substring(r + 1, e.length - 1), o;
  if (n === "color") {
    if (a = a.split(" "), o = a.shift(), a.length === 4 && a[3].charAt(0) === "/" && (a[3] = a[3].slice(1)), !["srgb", "display-p3", "a98-rgb", "prophoto-rgb", "rec-2020"].includes(o))
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: unsupported \`${o}\` color space.
The following color spaces are supported: srgb, display-p3, a98-rgb, prophoto-rgb, rec-2020.` : ht(10, o));
  } else
    a = a.split(",");
  return a = a.map((i) => parseFloat(i)), {
    type: n,
    values: a,
    colorSpace: o
  };
}
const fi = (e) => {
  const r = nt(e);
  return r.values.slice(0, 3).map((n, a) => r.type.includes("hsl") && a !== 0 ? `${n}%` : n).join(" ");
}, jt = (e, r) => {
  try {
    return fi(e);
  } catch {
    return r && process.env.NODE_ENV !== "production" && console.warn(r), e;
  }
};
function vr(e) {
  const {
    type: r,
    colorSpace: n
  } = e;
  let {
    values: a
  } = e;
  return r.includes("rgb") ? a = a.map((o, i) => i < 3 ? parseInt(o, 10) : o) : r.includes("hsl") && (a[1] = `${a[1]}%`, a[2] = `${a[2]}%`), r.includes("color") ? a = `${n} ${a.join(" ")}` : a = `${a.join(", ")}`, `${r}(${a})`;
}
function Xn(e) {
  e = nt(e);
  const {
    values: r
  } = e, n = r[0], a = r[1] / 100, o = r[2] / 100, i = a * Math.min(o, 1 - o), l = (u, p = (u + n / 30) % 12) => o - i * Math.max(Math.min(p - 3, 9 - p, 1), -1);
  let c = "rgb";
  const h = [Math.round(l(0) * 255), Math.round(l(8) * 255), Math.round(l(4) * 255)];
  return e.type === "hsla" && (c += "a", h.push(r[3])), vr({
    type: c,
    values: h
  });
}
function Nr(e) {
  e = nt(e);
  let r = e.type === "hsl" || e.type === "hsla" ? nt(Xn(e)).values : e.values;
  return r = r.map((n) => (e.type !== "color" && (n /= 255), n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4)), Number((0.2126 * r[0] + 0.7152 * r[1] + 0.0722 * r[2]).toFixed(3));
}
function un(e, r) {
  const n = Nr(e), a = Nr(r);
  return (Math.max(n, a) + 0.05) / (Math.min(n, a) + 0.05);
}
function Zn(e, r) {
  return e = nt(e), r = Fr(r), (e.type === "rgb" || e.type === "hsl") && (e.type += "a"), e.type === "color" ? e.values[3] = `/${r}` : e.values[3] = r, vr(e);
}
function lt(e, r, n) {
  try {
    return Zn(e, r);
  } catch {
    return n && process.env.NODE_ENV !== "production" && console.warn(n), e;
  }
}
function xr(e, r) {
  if (e = nt(e), r = Fr(r), e.type.includes("hsl"))
    e.values[2] *= 1 - r;
  else if (e.type.includes("rgb") || e.type.includes("color"))
    for (let n = 0; n < 3; n += 1)
      e.values[n] *= 1 - r;
  return vr(e);
}
function le(e, r, n) {
  try {
    return xr(e, r);
  } catch {
    return n && process.env.NODE_ENV !== "production" && console.warn(n), e;
  }
}
function Cr(e, r) {
  if (e = nt(e), r = Fr(r), e.type.includes("hsl"))
    e.values[2] += (100 - e.values[2]) * r;
  else if (e.type.includes("rgb"))
    for (let n = 0; n < 3; n += 1)
      e.values[n] += (255 - e.values[n]) * r;
  else if (e.type.includes("color"))
    for (let n = 0; n < 3; n += 1)
      e.values[n] += (1 - e.values[n]) * r;
  return vr(e);
}
function ce(e, r, n) {
  try {
    return Cr(e, r);
  } catch {
    return n && process.env.NODE_ENV !== "production" && console.warn(n), e;
  }
}
function pi(e, r = 0.15) {
  return Nr(e) > 0.5 ? xr(e, r) : Cr(e, r);
}
function Xt(e, r, n) {
  try {
    return pi(e, r);
  } catch {
    return e;
  }
}
const gi = /* @__PURE__ */ Xe.createContext(void 0);
process.env.NODE_ENV !== "production" && (ae.node, ae.object);
function yi(e) {
  const {
    theme: r,
    name: n,
    props: a
  } = e;
  if (!r || !r.components || !r.components[n])
    return a;
  const o = r.components[n];
  return o.defaultProps ? Dr(o.defaultProps, a, r.components.mergeClassNameAndStyle) : !o.styleOverrides && !o.variants ? Dr(o, a, r.components.mergeClassNameAndStyle) : a;
}
function bi({
  props: e,
  name: r
}) {
  const n = Xe.useContext(gi);
  return yi({
    props: e,
    name: r,
    theme: {
      components: n
    }
  });
}
const mn = {
  theme: void 0
};
function vi(e) {
  let r, n;
  return function(o) {
    let i = r;
    return (i === void 0 || o.theme !== n) && (mn.theme = o.theme, i = Jn(e(mn)), r = i, n = o.theme), i;
  };
}
function xi(e = "") {
  function r(...a) {
    if (!a.length)
      return "";
    const o = a[0];
    return typeof o == "string" && !o.match(/(#|\(|\)|(-?(\d*\.)?\d+)(px|em|%|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc))|^(-?(\d*\.)?\d+)$|(\d+ \d+ \d+)/) ? `, var(--${e ? `${e}-` : ""}${o}${r(...a.slice(1))})` : `, ${o}`;
  }
  return (a, ...o) => `var(--${e ? `${e}-` : ""}${a}${r(...o)})`;
}
const fn = (e, r, n, a = []) => {
  let o = e;
  r.forEach((i, l) => {
    l === r.length - 1 ? Array.isArray(o) ? o[Number(i)] = n : o && typeof o == "object" && (o[i] = n) : o && typeof o == "object" && (o[i] || (o[i] = a.includes(i) ? [] : {}), o = o[i]);
  });
}, Ci = (e, r, n) => {
  function a(o, i = [], l = []) {
    Object.entries(o).forEach(([c, h]) => {
      (!n || n && !n([...i, c])) && h != null && (typeof h == "object" && Object.keys(h).length > 0 ? a(h, [...i, c], Array.isArray(h) ? [...l, c] : l) : r([...i, c], h, l));
    });
  }
  a(e);
}, wi = (e, r) => typeof r == "number" ? ["lineHeight", "fontWeight", "opacity", "zIndex"].some((a) => e.includes(a)) || e[e.length - 1].toLowerCase().includes("opacity") ? r : `${r}px` : r;
function Er(e, r) {
  const {
    prefix: n,
    shouldSkipGeneratingVar: a
  } = r || {}, o = {}, i = {}, l = {};
  return Ci(
    e,
    (c, h, u) => {
      if ((typeof h == "string" || typeof h == "number") && (!a || !a(c, h))) {
        const p = `--${n ? `${n}-` : ""}${c.join("-")}`, g = wi(c, h);
        Object.assign(o, {
          [p]: g
        }), fn(i, c, `var(${p})`, u), fn(l, c, `var(${p}, ${g})`, u);
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
function Si(e, r = {}) {
  const {
    getSelector: n = N,
    disableCssColorScheme: a,
    colorSchemeSelector: o,
    enableContrastVars: i
  } = r, {
    colorSchemes: l = {},
    components: c,
    defaultColorScheme: h = "light",
    ...u
  } = e, {
    vars: p,
    css: g,
    varsWithDefaults: y
  } = Er(u, r);
  let w = y;
  const x = {}, {
    [h]: T,
    ...$
  } = l;
  if (Object.entries($ || {}).forEach(([b, k]) => {
    const {
      vars: D,
      css: U,
      varsWithDefaults: M
    } = Er(k, r);
    w = Ne(w, M), x[b] = {
      css: U,
      vars: D
    };
  }), T) {
    const {
      css: b,
      vars: k,
      varsWithDefaults: D
    } = Er(T, r);
    w = Ne(w, D), x[h] = {
      css: b,
      vars: k
    };
  }
  function N(b, k) {
    var U, M;
    let D = o;
    if (o === "class" && (D = ".%s"), o === "data" && (D = "[data-%s]"), o != null && o.startsWith("data-") && !o.includes("%s") && (D = `[${o}="%s"]`), b) {
      if (D === "media")
        return e.defaultColorScheme === b ? ":root" : {
          [`@media (prefers-color-scheme: ${((M = (U = l[b]) == null ? void 0 : U.palette) == null ? void 0 : M.mode) || b})`]: {
            ":root": k
          }
        };
      if (D)
        return e.defaultColorScheme === b ? `:root, ${D.replace("%s", String(b))}` : D.replace("%s", String(b));
    }
    return ":root";
  }
  return {
    vars: w,
    generateThemeVars: () => {
      let b = {
        ...p
      };
      return Object.entries(x).forEach(([, {
        vars: k
      }]) => {
        b = Ne(b, k);
      }), b;
    },
    generateStyleSheets: () => {
      var B, de;
      const b = [], k = e.defaultColorScheme || "light";
      function D(L, d) {
        Object.keys(d).length && b.push(typeof L == "string" ? {
          [L]: {
            ...d
          }
        } : L);
      }
      D(n(void 0, {
        ...g
      }), g);
      const {
        [k]: U,
        ...M
      } = x;
      if (U) {
        const {
          css: L
        } = U, d = (de = (B = l[k]) == null ? void 0 : B.palette) == null ? void 0 : de.mode, z = !a && d ? {
          colorScheme: d,
          ...L
        } : {
          ...L
        };
        D(n(k, {
          ...z
        }), z);
      }
      return Object.entries(M).forEach(([L, {
        css: d
      }]) => {
        var R, V;
        const z = (V = (R = l[L]) == null ? void 0 : R.palette) == null ? void 0 : V.mode, C = !a && z ? {
          colorScheme: z,
          ...d
        } : {
          ...d
        };
        D(n(L, {
          ...C
        }), C);
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
function ki(e) {
  return function(n) {
    return e === "media" ? (process.env.NODE_ENV !== "production" && n !== "light" && n !== "dark" && console.error(`MUI: @media (prefers-color-scheme) supports only 'light' or 'dark', but receive '${n}'.`), `@media (prefers-color-scheme: ${n})`) : e ? e.startsWith("data-") && !e.includes("%s") ? `[${e}="${n}"] &` : e === "class" ? `.${n} &` : e === "data" ? `[data-${n}] &` : `${e.replace("%s", n)} &` : "&";
  };
}
const Ht = {
  black: "#000",
  white: "#fff"
}, Ei = {
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
}, bt = {
  50: "#f3e5f5",
  200: "#ce93d8",
  300: "#ba68c8",
  400: "#ab47bc",
  500: "#9c27b0",
  700: "#7b1fa2"
}, vt = {
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
}, xt = {
  50: "#e3f2fd",
  200: "#90caf9",
  400: "#42a5f5",
  700: "#1976d2",
  800: "#1565c0"
}, Ct = {
  300: "#4fc3f7",
  400: "#29b6f6",
  500: "#03a9f4",
  700: "#0288d1",
  900: "#01579b"
}, wt = {
  300: "#81c784",
  400: "#66bb6a",
  500: "#4caf50",
  700: "#388e3c",
  800: "#2e7d32",
  900: "#1b5e20"
};
function ea() {
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
const ta = ea();
function ra() {
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
const zr = ra();
function pn(e, r, n, a) {
  const o = a.light || a, i = a.dark || a * 1.5;
  e[r] || (e.hasOwnProperty(n) ? e[r] = e[n] : r === "light" ? e.light = Cr(e.main, o) : r === "dark" && (e.dark = xr(e.main, i)));
}
function gn(e, r, n, a, o) {
  const i = o.light || o, l = o.dark || o * 1.5;
  r[n] || (r.hasOwnProperty(a) ? r[n] = r[a] : n === "light" ? r.light = `color-mix(in ${e}, ${r.main}, #fff ${(i * 100).toFixed(0)}%)` : n === "dark" && (r.dark = `color-mix(in ${e}, ${r.main}, #000 ${(l * 100).toFixed(0)}%)`));
}
function Ii(e = "light") {
  return e === "dark" ? {
    main: xt[200],
    light: xt[50],
    dark: xt[400]
  } : {
    main: xt[700],
    light: xt[400],
    dark: xt[800]
  };
}
function $i(e = "light") {
  return e === "dark" ? {
    main: bt[200],
    light: bt[50],
    dark: bt[400]
  } : {
    main: bt[500],
    light: bt[300],
    dark: bt[700]
  };
}
function Ai(e = "light") {
  return e === "dark" ? {
    main: vt[500],
    light: vt[300],
    dark: vt[700]
  } : {
    main: vt[700],
    light: vt[400],
    dark: vt[800]
  };
}
function Ti(e = "light") {
  return e === "dark" ? {
    main: Ct[400],
    light: Ct[300],
    dark: Ct[700]
  } : {
    main: Ct[700],
    light: Ct[500],
    dark: Ct[900]
  };
}
function Pi(e = "light") {
  return e === "dark" ? {
    main: wt[400],
    light: wt[300],
    dark: wt[700]
  } : {
    main: wt[800],
    light: wt[500],
    dark: wt[900]
  };
}
function Di(e = "light") {
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
function Ni(e) {
  return `oklch(from ${e} var(--__l) 0 h / var(--__a))`;
}
function Ur(e) {
  const {
    mode: r = "light",
    contrastThreshold: n = 3,
    tonalOffset: a = 0.2,
    colorSpace: o,
    ...i
  } = e, l = e.primary || Ii(r), c = e.secondary || $i(r), h = e.error || Ai(r), u = e.info || Ti(r), p = e.success || Pi(r), g = e.warning || Di(r);
  function y($) {
    if (o)
      return Ni($);
    const N = un($, zr.text.primary) >= n ? zr.text.primary : ta.text.primary;
    if (process.env.NODE_ENV !== "production") {
      const O = un($, N);
      O < 3 && console.error([`MUI: The contrast ratio of ${O}:1 for ${N} on ${$}`, "falls below the WCAG recommended absolute minimum contrast ratio of 3:1.", "https://www.w3.org/TR/2008/REC-WCAG20-20081211/#visual-audio-contrast-contrast"].join(`
`));
    }
    return N;
  }
  const w = ({
    color: $,
    name: N,
    mainShade: O = 500,
    lightShade: I = 300,
    darkShade: b = 700
  }) => {
    if ($ = {
      ...$
    }, !$.main && $[O] && ($.main = $[O]), !$.hasOwnProperty("main"))
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The color${N ? ` (${N})` : ""} provided to augmentColor(color) is invalid.
The color object needs to have a \`main\` property or a \`${O}\` property.` : ht(11, N ? ` (${N})` : "", O));
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
} });` : ht(12, N ? ` (${N})` : "", JSON.stringify($.main)));
    return o ? (gn(o, $, "light", I, a), gn(o, $, "dark", b, a)) : (pn($, "light", I, a), pn($, "dark", b, a)), $.contrastText || ($.contrastText = y($.main)), $;
  };
  let x;
  return r === "light" ? x = ea() : r === "dark" && (x = ra()), process.env.NODE_ENV !== "production" && (x || console.error(`MUI: The palette mode \`${r}\` is not supported.`)), Ne({
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
    grey: Ei,
    // Used by `getContrastText()` to maximize the contrast between
    // the background and the text.
    contrastThreshold: n,
    // Takes a background color and returns the text color that maximizes the contrast.
    getContrastText: y,
    // Generate a rich color object.
    augmentColor: w,
    // Used by the functions below to shift a color's luminance by approximately
    // two indexes within its tonal palette.
    // E.g., shift from Red 500 to Red 300 or Red 700.
    tonalOffset: a,
    // The light and dark mode object.
    ...x
  }, i);
}
function zi(e) {
  const r = {};
  return Object.entries(e).forEach((a) => {
    const [o, i] = a;
    typeof i == "object" && (r[o] = `${i.fontStyle ? `${i.fontStyle} ` : ""}${i.fontVariant ? `${i.fontVariant} ` : ""}${i.fontWeight ? `${i.fontWeight} ` : ""}${i.fontStretch ? `${i.fontStretch} ` : ""}${i.fontSize || ""}${i.lineHeight ? `/${i.lineHeight} ` : ""}${i.fontFamily || ""}`);
  }), r;
}
function _i(e, r) {
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
function Oi(e) {
  return Math.round(e * 1e5) / 1e5;
}
const yn = {
  textTransform: "uppercase"
}, bn = '"Roboto", "Helvetica", "Arial", sans-serif';
function Bi(e, r) {
  const {
    fontFamily: n = bn,
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
    pxToRem: p,
    ...g
  } = typeof r == "function" ? r(e) : r;
  process.env.NODE_ENV !== "production" && (typeof a != "number" && console.error("MUI: `fontSize` is required to be a number."), typeof h != "number" && console.error("MUI: `htmlFontSize` is required to be a number."));
  const y = a / 14, w = p || (($) => `${$ / h * y}rem`), x = ($, N, O, I, b) => ({
    fontFamily: n,
    fontWeight: $,
    fontSize: w(N),
    // Unitless following https://meyerweb.com/eric/thoughts/2006/02/08/unitless-line-heights/
    lineHeight: O,
    // The letter spacing was designed for the Roboto font-family. Using the same letter-spacing
    // across font-families can cause issues with the kerning.
    ...n === bn ? {
      letterSpacing: `${Oi(I / N)}em`
    } : {},
    ...b,
    ...u
  }), T = {
    h1: x(o, 96, 1.167, -1.5),
    h2: x(o, 60, 1.2, -0.5),
    h3: x(i, 48, 1.167, 0),
    h4: x(i, 34, 1.235, 0.25),
    h5: x(i, 24, 1.334, 0),
    h6: x(l, 20, 1.6, 0.15),
    subtitle1: x(i, 16, 1.75, 0.15),
    subtitle2: x(l, 14, 1.57, 0.1),
    body1: x(i, 16, 1.5, 0.15),
    body2: x(i, 14, 1.43, 0.15),
    button: x(l, 14, 1.75, 0.4, yn),
    caption: x(i, 12, 1.66, 0.4),
    overline: x(i, 12, 2.66, 1, yn),
    // TODO v6: Remove handling of 'inherit' variant from the theme as it is already handled in Material UI's Typography component. Also, remember to remove the associated types.
    inherit: {
      fontFamily: "inherit",
      fontWeight: "inherit",
      fontSize: "inherit",
      lineHeight: "inherit",
      letterSpacing: "inherit"
    }
  };
  return Ne({
    htmlFontSize: h,
    pxToRem: w,
    fontFamily: n,
    fontSize: a,
    fontWeightLight: o,
    fontWeightRegular: i,
    fontWeightMedium: l,
    fontWeightBold: c,
    ...T
  }, g, {
    clone: !1
    // No need to clone deep
  });
}
const Mi = 0.2, Ri = 0.14, Li = 0.12;
function ue(...e) {
  return [`${e[0]}px ${e[1]}px ${e[2]}px ${e[3]}px rgba(0,0,0,${Mi})`, `${e[4]}px ${e[5]}px ${e[6]}px ${e[7]}px rgba(0,0,0,${Ri})`, `${e[8]}px ${e[9]}px ${e[10]}px ${e[11]}px rgba(0,0,0,${Li})`].join(",");
}
const Wi = ["none", ue(0, 2, 1, -1, 0, 1, 1, 0, 0, 1, 3, 0), ue(0, 3, 1, -2, 0, 2, 2, 0, 0, 1, 5, 0), ue(0, 3, 3, -2, 0, 3, 4, 0, 0, 1, 8, 0), ue(0, 2, 4, -1, 0, 4, 5, 0, 0, 1, 10, 0), ue(0, 3, 5, -1, 0, 5, 8, 0, 0, 1, 14, 0), ue(0, 3, 5, -1, 0, 6, 10, 0, 0, 1, 18, 0), ue(0, 4, 5, -2, 0, 7, 10, 1, 0, 2, 16, 1), ue(0, 5, 5, -3, 0, 8, 10, 1, 0, 3, 14, 2), ue(0, 5, 6, -3, 0, 9, 12, 1, 0, 3, 16, 2), ue(0, 6, 6, -3, 0, 10, 14, 1, 0, 4, 18, 3), ue(0, 6, 7, -4, 0, 11, 15, 1, 0, 4, 20, 3), ue(0, 7, 8, -4, 0, 12, 17, 2, 0, 5, 22, 4), ue(0, 7, 8, -4, 0, 13, 19, 2, 0, 5, 24, 4), ue(0, 7, 9, -4, 0, 14, 21, 2, 0, 5, 26, 4), ue(0, 8, 9, -5, 0, 15, 22, 2, 0, 6, 28, 5), ue(0, 8, 10, -5, 0, 16, 24, 2, 0, 6, 30, 5), ue(0, 8, 11, -5, 0, 17, 26, 2, 0, 6, 32, 5), ue(0, 9, 11, -5, 0, 18, 28, 2, 0, 7, 34, 6), ue(0, 9, 12, -6, 0, 19, 29, 2, 0, 7, 36, 6), ue(0, 10, 13, -6, 0, 20, 31, 3, 0, 8, 38, 7), ue(0, 10, 13, -6, 0, 21, 33, 3, 0, 8, 40, 7), ue(0, 10, 14, -6, 0, 22, 35, 3, 0, 8, 42, 7), ue(0, 11, 14, -7, 0, 23, 36, 3, 0, 9, 44, 8), ue(0, 11, 15, -7, 0, 24, 38, 3, 0, 9, 46, 8)], ji = {
  // This is the most common easing curve.
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  // Objects enter the screen at full velocity from off-screen and
  // slowly decelerate to a resting point.
  easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
  // Objects leave the screen at full velocity. They do not decelerate when off-screen.
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  // The sharp curve is used by objects that may return to the screen at any time.
  sharp: "cubic-bezier(0.4, 0, 0.6, 1)"
}, Fi = {
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
function vn(e) {
  return `${Math.round(e)}ms`;
}
function Ui(e) {
  if (!e)
    return 0;
  const r = e / 36;
  return Math.min(Math.round((4 + 15 * r ** 0.25 + r / 5) * 10), 3e3);
}
function Vi(e) {
  const r = {
    ...ji,
    ...e.easing
  }, n = {
    ...Fi,
    ...e.duration
  };
  return {
    getAutoHeightDuration: Ui,
    create: (o = ["all"], i = {}) => {
      const {
        duration: l = n.standard,
        easing: c = r.easeInOut,
        delay: h = 0,
        ...u
      } = i;
      if (process.env.NODE_ENV !== "production") {
        const p = (y) => typeof y == "string", g = (y) => !Number.isNaN(parseFloat(y));
        !p(o) && !Array.isArray(o) && console.error('MUI: Argument "props" must be a string or Array.'), !g(l) && !p(l) && console.error(`MUI: Argument "duration" must be a number or a string but found ${l}.`), p(c) || console.error('MUI: Argument "easing" must be a string.'), !g(h) && !p(h) && console.error('MUI: Argument "delay" must be a number or a string.'), typeof i != "object" && console.error(["MUI: Secong argument of transition.create must be an object.", "Arguments should be either `create('prop1', options)` or `create(['prop1', 'prop2'], options)`"].join(`
`)), Object.keys(u).length !== 0 && console.error(`MUI: Unrecognized argument(s) [${Object.keys(u).join(",")}].`);
      }
      return (Array.isArray(o) ? o : [o]).map((p) => `${p} ${typeof l == "string" ? l : vn(l)} ${c} ${typeof h == "string" ? h : vn(h)}`).join(",");
    },
    ...e,
    easing: r,
    duration: n
  };
}
const Hi = {
  mobileStepper: 1e3,
  fab: 1050,
  speedDial: 1050,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500
};
function Ki(e) {
  return Ve(e) || typeof e > "u" || typeof e == "string" || typeof e == "boolean" || typeof e == "number" || Array.isArray(e);
}
function na(e = {}) {
  const r = {
    ...e
  };
  function n(a) {
    const o = Object.entries(a);
    for (let i = 0; i < o.length; i++) {
      const [l, c] = o[i];
      !Ki(c) || l.startsWith("unstable_") ? delete a[l] : Ve(c) && (a[l] = {
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
function xn(e) {
  return typeof e == "number" ? `${(e * 100).toFixed(0)}%` : `calc((${e}) * 100%)`;
}
const Gi = (e) => {
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
function qi(e) {
  Object.assign(e, {
    alpha(r, n) {
      const a = this || e;
      return a.colorSpace ? `oklch(from ${r} l c h / ${typeof n == "string" ? `calc(${n})` : n})` : a.vars ? `rgba(${r.replace(/var\(--([^,\s)]+)(?:,[^)]+)?\)+/g, "var(--$1Channel)")} / ${typeof n == "string" ? `calc(${n})` : n})` : Zn(r, Gi(n));
    },
    lighten(r, n) {
      const a = this || e;
      return a.colorSpace ? `color-mix(in ${a.colorSpace}, ${r}, #fff ${xn(n)})` : Cr(r, n);
    },
    darken(r, n) {
      const a = this || e;
      return a.colorSpace ? `color-mix(in ${a.colorSpace}, ${r}, #000 ${xn(n)})` : xr(r, n);
    }
  });
}
function _r(e = {}, ...r) {
  const {
    breakpoints: n,
    mixins: a = {},
    spacing: o,
    palette: i = {},
    transitions: l = {},
    typography: c = {},
    shape: h,
    colorSpace: u,
    ...p
  } = e;
  if (e.vars && // The error should throw only for the root theme creation because user is not allowed to use a custom node `vars`.
  // `generateThemeVars` is the closest identifier for checking that the `options` is a result of `createTheme` with CSS variables so that user can create new theme for nested ThemeProvider.
  e.generateThemeVars === void 0)
    throw new Error(process.env.NODE_ENV !== "production" ? "MUI: `vars` is a private field used for CSS variables support.\nPlease use another name or follow the [docs](https://mui.com/material-ui/customization/css-theme-variables/usage/) to enable the feature." : ht(20));
  const g = Ur({
    ...i,
    colorSpace: u
  }), y = Gn(e);
  let w = Ne(y, {
    mixins: _i(y.breakpoints, a),
    palette: g,
    // Don't use [...shadows] until you've verified its transpiled code is not invoking the iterator protocol.
    shadows: Wi.slice(),
    typography: Bi(g, c),
    transitions: Vi(l),
    zIndex: {
      ...Hi
    }
  });
  if (w = Ne(w, p), w = r.reduce((x, T) => Ne(x, T), w), process.env.NODE_ENV !== "production") {
    const x = ["active", "checked", "completed", "disabled", "error", "expanded", "focused", "focusVisible", "required", "selected"], T = ($, N) => {
      let O;
      for (O in $) {
        const I = $[O];
        if (x.includes(O) && Object.keys(I).length > 0) {
          if (process.env.NODE_ENV !== "production") {
            const b = jr("", O);
            console.error([`MUI: The \`${N}\` component increases the CSS specificity of the \`${O}\` internal state.`, "You can not override it like this: ", JSON.stringify($, null, 2), "", `Instead, you need to use the '&.${b}' syntax:`, JSON.stringify({
              root: {
                [`&.${b}`]: I
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
      N && $.startsWith("Mui") && T(N, $);
    });
  }
  return w.unstable_sxConfig = {
    ...br,
    ...p == null ? void 0 : p.unstable_sxConfig
  }, w.unstable_sx = function(T) {
    return At({
      sx: T,
      theme: this
    });
  }, w.toRuntimeSource = na, qi(w), w;
}
function Ji(e) {
  let r;
  return e < 1 ? r = 5.11916 * e ** 2 : r = 4.5 * Math.log(e + 1) + 2, Math.round(r * 10) / 1e3;
}
const Qi = [...Array(25)].map((e, r) => {
  if (r === 0)
    return "none";
  const n = Ji(r);
  return `linear-gradient(rgba(255 255 255 / ${n}), rgba(255 255 255 / ${n}))`;
});
function aa(e) {
  return {
    inputPlaceholder: e === "dark" ? 0.5 : 0.42,
    inputUnderline: e === "dark" ? 0.7 : 0.42,
    switchTrackDisabled: e === "dark" ? 0.2 : 0.12,
    switchTrack: e === "dark" ? 0.3 : 0.38
  };
}
function oa(e) {
  return e === "dark" ? Qi : [];
}
function Yi(e) {
  const {
    palette: r = {
      mode: "light"
    },
    // need to cast to avoid module augmentation test
    opacity: n,
    overlays: a,
    colorSpace: o,
    ...i
  } = e, l = Ur({
    ...r,
    colorSpace: o
  });
  return {
    palette: l,
    opacity: {
      ...aa(l.mode),
      ...n
    },
    overlays: a || oa(l.mode),
    ...i
  };
}
function Xi(e) {
  var r;
  return !!e[0].match(/(cssVarPrefix|colorSchemeSelector|modularCssLayers|rootSelector|typography|mixins|breakpoints|direction|transitions)/) || !!e[0].match(/sxConfig$/) || // ends with sxConfig
  e[0] === "palette" && !!((r = e[1]) != null && r.match(/(mode|contrastThreshold|tonalOffset)/));
}
const Zi = (e) => [...[...Array(25)].map((r, n) => `--${e ? `${e}-` : ""}overlays-${n}`), `--${e ? `${e}-` : ""}palette-AppBar-darkBg`, `--${e ? `${e}-` : ""}palette-AppBar-darkColor`], es = (e) => (r, n) => {
  const a = e.rootSelector || ":root", o = e.colorSchemeSelector;
  let i = o;
  if (o === "class" && (i = ".%s"), o === "data" && (i = "[data-%s]"), o != null && o.startsWith("data-") && !o.includes("%s") && (i = `[${o}="%s"]`), e.defaultColorScheme === r) {
    if (r === "dark") {
      const l = {};
      return Zi(e.cssVarPrefix).forEach((c) => {
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
function ts(e, r) {
  r.forEach((n) => {
    e[n] || (e[n] = {});
  });
}
function S(e, r, n) {
  !e[r] && n && (e[r] = n);
}
function Ft(e) {
  return typeof e != "string" || !e.startsWith("hsl") ? e : Xn(e);
}
function Ue(e, r) {
  `${r}Channel` in e || (e[`${r}Channel`] = jt(Ft(e[r]), `MUI: Can't create \`palette.${r}Channel\` because \`palette.${r}\` is not one of these formats: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().
To suppress this warning, you need to explicitly provide the \`palette.${r}Channel\` as a string (in rgb format, for example "12 12 12") or undefined if you want to remove the channel token.`));
}
function rs(e) {
  return typeof e == "number" ? `${e}px` : typeof e == "string" || typeof e == "function" || Array.isArray(e) ? e : "8px";
}
const je = (e) => {
  try {
    return e();
  } catch {
  }
}, ns = (e = "mui") => xi(e);
function Ir(e, r, n, a, o) {
  if (!n)
    return;
  n = n === !0 ? {} : n;
  const i = o === "dark" ? "dark" : "light";
  if (!a) {
    r[o] = Yi({
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
  } = _r({
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
      ...aa(i),
      ...n == null ? void 0 : n.opacity
    },
    overlays: (n == null ? void 0 : n.overlays) || oa(i)
  }, c;
}
function as(e = {}, ...r) {
  const {
    colorSchemes: n = {
      light: !0
    },
    defaultColorScheme: a,
    disableCssColorScheme: o = !1,
    cssVarPrefix: i = "mui",
    nativeColor: l = !1,
    shouldSkipGeneratingVar: c = Xi,
    colorSchemeSelector: h = n.light && n.dark ? "media" : void 0,
    rootSelector: u = ":root",
    ...p
  } = e, g = Object.keys(n)[0], y = a || (n.light && g !== "light" ? "light" : g), w = ns(i), {
    [y]: x,
    light: T,
    dark: $,
    ...N
  } = n, O = {
    ...N
  };
  let I = x;
  if ((y === "dark" && !("dark" in n) || y === "light" && !("light" in n)) && (I = !0), !I)
    throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The \`colorSchemes.${y}\` option is either missing or invalid.` : ht(21, y));
  let b;
  l && (b = "oklch");
  const k = Ir(b, O, I, p, y);
  T && !O.light && Ir(b, O, T, void 0, "light"), $ && !O.dark && Ir(b, O, $, void 0, "dark");
  let D = {
    defaultColorScheme: y,
    ...k,
    cssVarPrefix: i,
    colorSchemeSelector: h,
    rootSelector: u,
    getCssVar: w,
    colorSchemes: O,
    font: {
      ...zi(k.typography),
      ...k.font
    },
    spacing: rs(p.spacing)
  };
  Object.keys(D.colorSchemes).forEach((L) => {
    const d = D.colorSchemes[L].palette, z = (R) => {
      const V = R.split("-"), he = V[1], G = V[2];
      return w(R, d[he][G]);
    };
    d.mode === "light" && (S(d.common, "background", "#fff"), S(d.common, "onBackground", "#000")), d.mode === "dark" && (S(d.common, "background", "#000"), S(d.common, "onBackground", "#fff"));
    function C(R, V, he) {
      if (b) {
        let G;
        return R === lt && (G = `transparent ${((1 - he) * 100).toFixed(0)}%`), R === le && (G = `#000 ${(he * 100).toFixed(0)}%`), R === ce && (G = `#fff ${(he * 100).toFixed(0)}%`), `color-mix(in ${b}, ${V}, ${G})`;
      }
      return R(V, he);
    }
    if (ts(d, ["Alert", "AppBar", "Avatar", "Button", "Chip", "FilledInput", "LinearProgress", "Skeleton", "Slider", "SnackbarContent", "SpeedDialAction", "StepConnector", "StepContent", "Switch", "TableCell", "Tooltip"]), d.mode === "light") {
      S(d.Alert, "errorColor", C(le, d.error.light, 0.6)), S(d.Alert, "infoColor", C(le, d.info.light, 0.6)), S(d.Alert, "successColor", C(le, d.success.light, 0.6)), S(d.Alert, "warningColor", C(le, d.warning.light, 0.6)), S(d.Alert, "errorFilledBg", z("palette-error-main")), S(d.Alert, "infoFilledBg", z("palette-info-main")), S(d.Alert, "successFilledBg", z("palette-success-main")), S(d.Alert, "warningFilledBg", z("palette-warning-main")), S(d.Alert, "errorFilledColor", je(() => d.getContrastText(d.error.main))), S(d.Alert, "infoFilledColor", je(() => d.getContrastText(d.info.main))), S(d.Alert, "successFilledColor", je(() => d.getContrastText(d.success.main))), S(d.Alert, "warningFilledColor", je(() => d.getContrastText(d.warning.main))), S(d.Alert, "errorStandardBg", C(ce, d.error.light, 0.9)), S(d.Alert, "infoStandardBg", C(ce, d.info.light, 0.9)), S(d.Alert, "successStandardBg", C(ce, d.success.light, 0.9)), S(d.Alert, "warningStandardBg", C(ce, d.warning.light, 0.9)), S(d.Alert, "errorIconColor", z("palette-error-main")), S(d.Alert, "infoIconColor", z("palette-info-main")), S(d.Alert, "successIconColor", z("palette-success-main")), S(d.Alert, "warningIconColor", z("palette-warning-main")), S(d.AppBar, "defaultBg", z("palette-grey-100")), S(d.Avatar, "defaultBg", z("palette-grey-400")), S(d.Button, "inheritContainedBg", z("palette-grey-300")), S(d.Button, "inheritContainedHoverBg", z("palette-grey-A100")), S(d.Chip, "defaultBorder", z("palette-grey-400")), S(d.Chip, "defaultAvatarColor", z("palette-grey-700")), S(d.Chip, "defaultIconColor", z("palette-grey-700")), S(d.FilledInput, "bg", "rgba(0, 0, 0, 0.06)"), S(d.FilledInput, "hoverBg", "rgba(0, 0, 0, 0.09)"), S(d.FilledInput, "disabledBg", "rgba(0, 0, 0, 0.12)"), S(d.LinearProgress, "primaryBg", C(ce, d.primary.main, 0.62)), S(d.LinearProgress, "secondaryBg", C(ce, d.secondary.main, 0.62)), S(d.LinearProgress, "errorBg", C(ce, d.error.main, 0.62)), S(d.LinearProgress, "infoBg", C(ce, d.info.main, 0.62)), S(d.LinearProgress, "successBg", C(ce, d.success.main, 0.62)), S(d.LinearProgress, "warningBg", C(ce, d.warning.main, 0.62)), S(d.Skeleton, "bg", b ? C(lt, d.text.primary, 0.11) : `rgba(${z("palette-text-primaryChannel")} / 0.11)`), S(d.Slider, "primaryTrack", C(ce, d.primary.main, 0.62)), S(d.Slider, "secondaryTrack", C(ce, d.secondary.main, 0.62)), S(d.Slider, "errorTrack", C(ce, d.error.main, 0.62)), S(d.Slider, "infoTrack", C(ce, d.info.main, 0.62)), S(d.Slider, "successTrack", C(ce, d.success.main, 0.62)), S(d.Slider, "warningTrack", C(ce, d.warning.main, 0.62));
      const R = b ? C(le, d.background.default, 0.6825) : Xt(d.background.default, 0.8);
      S(d.SnackbarContent, "bg", R), S(d.SnackbarContent, "color", je(() => b ? zr.text.primary : d.getContrastText(R))), S(d.SpeedDialAction, "fabHoverBg", Xt(d.background.paper, 0.15)), S(d.StepConnector, "border", z("palette-grey-400")), S(d.StepContent, "border", z("palette-grey-400")), S(d.Switch, "defaultColor", z("palette-common-white")), S(d.Switch, "defaultDisabledColor", z("palette-grey-100")), S(d.Switch, "primaryDisabledColor", C(ce, d.primary.main, 0.62)), S(d.Switch, "secondaryDisabledColor", C(ce, d.secondary.main, 0.62)), S(d.Switch, "errorDisabledColor", C(ce, d.error.main, 0.62)), S(d.Switch, "infoDisabledColor", C(ce, d.info.main, 0.62)), S(d.Switch, "successDisabledColor", C(ce, d.success.main, 0.62)), S(d.Switch, "warningDisabledColor", C(ce, d.warning.main, 0.62)), S(d.TableCell, "border", C(ce, C(lt, d.divider, 1), 0.88)), S(d.Tooltip, "bg", C(lt, d.grey[700], 0.92));
    }
    if (d.mode === "dark") {
      S(d.Alert, "errorColor", C(ce, d.error.light, 0.6)), S(d.Alert, "infoColor", C(ce, d.info.light, 0.6)), S(d.Alert, "successColor", C(ce, d.success.light, 0.6)), S(d.Alert, "warningColor", C(ce, d.warning.light, 0.6)), S(d.Alert, "errorFilledBg", z("palette-error-dark")), S(d.Alert, "infoFilledBg", z("palette-info-dark")), S(d.Alert, "successFilledBg", z("palette-success-dark")), S(d.Alert, "warningFilledBg", z("palette-warning-dark")), S(d.Alert, "errorFilledColor", je(() => d.getContrastText(d.error.dark))), S(d.Alert, "infoFilledColor", je(() => d.getContrastText(d.info.dark))), S(d.Alert, "successFilledColor", je(() => d.getContrastText(d.success.dark))), S(d.Alert, "warningFilledColor", je(() => d.getContrastText(d.warning.dark))), S(d.Alert, "errorStandardBg", C(le, d.error.light, 0.9)), S(d.Alert, "infoStandardBg", C(le, d.info.light, 0.9)), S(d.Alert, "successStandardBg", C(le, d.success.light, 0.9)), S(d.Alert, "warningStandardBg", C(le, d.warning.light, 0.9)), S(d.Alert, "errorIconColor", z("palette-error-main")), S(d.Alert, "infoIconColor", z("palette-info-main")), S(d.Alert, "successIconColor", z("palette-success-main")), S(d.Alert, "warningIconColor", z("palette-warning-main")), S(d.AppBar, "defaultBg", z("palette-grey-900")), S(d.AppBar, "darkBg", z("palette-background-paper")), S(d.AppBar, "darkColor", z("palette-text-primary")), S(d.Avatar, "defaultBg", z("palette-grey-600")), S(d.Button, "inheritContainedBg", z("palette-grey-800")), S(d.Button, "inheritContainedHoverBg", z("palette-grey-700")), S(d.Chip, "defaultBorder", z("palette-grey-700")), S(d.Chip, "defaultAvatarColor", z("palette-grey-300")), S(d.Chip, "defaultIconColor", z("palette-grey-300")), S(d.FilledInput, "bg", "rgba(255, 255, 255, 0.09)"), S(d.FilledInput, "hoverBg", "rgba(255, 255, 255, 0.13)"), S(d.FilledInput, "disabledBg", "rgba(255, 255, 255, 0.12)"), S(d.LinearProgress, "primaryBg", C(le, d.primary.main, 0.5)), S(d.LinearProgress, "secondaryBg", C(le, d.secondary.main, 0.5)), S(d.LinearProgress, "errorBg", C(le, d.error.main, 0.5)), S(d.LinearProgress, "infoBg", C(le, d.info.main, 0.5)), S(d.LinearProgress, "successBg", C(le, d.success.main, 0.5)), S(d.LinearProgress, "warningBg", C(le, d.warning.main, 0.5)), S(d.Skeleton, "bg", b ? C(lt, d.text.primary, 0.13) : `rgba(${z("palette-text-primaryChannel")} / 0.13)`), S(d.Slider, "primaryTrack", C(le, d.primary.main, 0.5)), S(d.Slider, "secondaryTrack", C(le, d.secondary.main, 0.5)), S(d.Slider, "errorTrack", C(le, d.error.main, 0.5)), S(d.Slider, "infoTrack", C(le, d.info.main, 0.5)), S(d.Slider, "successTrack", C(le, d.success.main, 0.5)), S(d.Slider, "warningTrack", C(le, d.warning.main, 0.5));
      const R = b ? C(ce, d.background.default, 0.985) : Xt(d.background.default, 0.98);
      S(d.SnackbarContent, "bg", R), S(d.SnackbarContent, "color", je(() => b ? ta.text.primary : d.getContrastText(R))), S(d.SpeedDialAction, "fabHoverBg", Xt(d.background.paper, 0.15)), S(d.StepConnector, "border", z("palette-grey-600")), S(d.StepContent, "border", z("palette-grey-600")), S(d.Switch, "defaultColor", z("palette-grey-300")), S(d.Switch, "defaultDisabledColor", z("palette-grey-600")), S(d.Switch, "primaryDisabledColor", C(le, d.primary.main, 0.55)), S(d.Switch, "secondaryDisabledColor", C(le, d.secondary.main, 0.55)), S(d.Switch, "errorDisabledColor", C(le, d.error.main, 0.55)), S(d.Switch, "infoDisabledColor", C(le, d.info.main, 0.55)), S(d.Switch, "successDisabledColor", C(le, d.success.main, 0.55)), S(d.Switch, "warningDisabledColor", C(le, d.warning.main, 0.55)), S(d.TableCell, "border", C(le, C(lt, d.divider, 1), 0.68)), S(d.Tooltip, "bg", C(lt, d.grey[700], 0.92));
    }
    Ue(d.background, "default"), Ue(d.background, "paper"), Ue(d.common, "background"), Ue(d.common, "onBackground"), Ue(d, "divider"), Object.keys(d).forEach((R) => {
      const V = d[R];
      R !== "tonalOffset" && V && typeof V == "object" && (V.main && S(d[R], "mainChannel", jt(Ft(V.main))), V.light && S(d[R], "lightChannel", jt(Ft(V.light))), V.dark && S(d[R], "darkChannel", jt(Ft(V.dark))), V.contrastText && S(d[R], "contrastTextChannel", jt(Ft(V.contrastText))), R === "text" && (Ue(d[R], "primary"), Ue(d[R], "secondary")), R === "action" && (V.active && Ue(d[R], "active"), V.selected && Ue(d[R], "selected")));
    });
  }), D = r.reduce((L, d) => Ne(L, d), D);
  const U = {
    prefix: i,
    disableCssColorScheme: o,
    shouldSkipGeneratingVar: c,
    getSelector: es(D),
    enableContrastVars: l
  }, {
    vars: M,
    generateThemeVars: B,
    generateStyleSheets: de
  } = Si(D, U);
  return D.vars = M, Object.entries(D.colorSchemes[D.defaultColorScheme]).forEach(([L, d]) => {
    D[L] = d;
  }), D.generateThemeVars = B, D.generateStyleSheets = de, D.generateSpacing = function() {
    return Kn(p.spacing, Lr(this));
  }, D.getColorSchemeSelector = ki(h), D.spacing = D.generateSpacing(), D.shouldSkipGeneratingVar = c, D.unstable_sxConfig = {
    ...br,
    ...p == null ? void 0 : p.unstable_sxConfig
  }, D.unstable_sx = function(d) {
    return At({
      sx: d,
      theme: this
    });
  }, D.toRuntimeSource = na, D;
}
function Cn(e, r, n) {
  e.colorSchemes && n && (e.colorSchemes[r] = {
    ...n !== !0 && n,
    palette: Ur({
      ...n === !0 ? {} : n.palette,
      mode: r
    })
    // cast type to skip module augmentation test
  });
}
function os(e = {}, ...r) {
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
      return _r(e, ...r);
    let p = n;
    "palette" in e || u[c] && (u[c] !== !0 ? p = u[c].palette : c === "dark" && (p = {
      mode: "dark"
    }));
    const g = _r({
      ...e,
      palette: p
    }, ...r);
    return g.defaultColorScheme = c, g.colorSchemes = u, g.palette.mode === "light" && (g.colorSchemes.light = {
      ...u.light !== !0 && u.light,
      palette: g.palette
    }, Cn(g, "dark", u.dark)), g.palette.mode === "dark" && (g.colorSchemes.dark = {
      ...u.dark !== !0 && u.dark,
      palette: g.palette
    }, Cn(g, "light", u.light)), g;
  }
  return !n && !("light" in u) && c === "light" && (u.light = !0), as({
    ...l,
    colorSchemes: u,
    defaultColorScheme: c,
    ...typeof a != "boolean" && a
  }, ...r);
}
const is = os(), ss = "$$material";
function ls(e) {
  return e !== "ownerState" && e !== "theme" && e !== "sx" && e !== "as";
}
const cs = (e) => ls(e) && e !== "classes", ds = si({
  themeId: ss,
  defaultTheme: is,
  rootShouldForwardProp: cs
}), hs = vi;
process.env.NODE_ENV !== "production" && (ae.node, ae.object.isRequired);
function us(e) {
  return bi(e);
}
function ms(e) {
  return jr("MuiSvgIcon", e);
}
ri("MuiSvgIcon", ["root", "colorPrimary", "colorSecondary", "colorAction", "colorError", "colorDisabled", "fontSizeInherit", "fontSizeSmall", "fontSizeMedium", "fontSizeLarge"]);
const fs = (e) => {
  const {
    color: r,
    fontSize: n,
    classes: a
  } = e, o = {
    root: ["root", r !== "inherit" && `color${ut(r)}`, `fontSize${ut(n)}`]
  };
  return Ja(o, ms, a);
}, ps = ds("svg", {
  name: "MuiSvgIcon",
  slot: "Root",
  overridesResolver: (e, r) => {
    const {
      ownerState: n
    } = e;
    return [r.root, n.color !== "inherit" && r[`color${ut(n.color)}`], r[`fontSize${ut(n.fontSize)}`]];
  }
})(hs(({
  theme: e
}) => {
  var r, n, a, o, i, l, c, h, u, p, g, y, w, x;
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
        props: (T) => !T.hasSvgAsChild,
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
          fontSize: ((p = (u = e.typography) == null ? void 0 : u.pxToRem) == null ? void 0 : p.call(u, 35)) || "2.1875rem"
        }
      },
      // TODO v5 deprecate color prop, v6 remove for sx
      ...Object.entries((e.vars ?? e).palette).filter(([, T]) => T && T.main).map(([T]) => {
        var $, N;
        return {
          props: {
            color: T
          },
          style: {
            color: (N = ($ = (e.vars ?? e).palette) == null ? void 0 : $[T]) == null ? void 0 : N.main
          }
        };
      }),
      {
        props: {
          color: "action"
        },
        style: {
          color: (y = (g = (e.vars ?? e).palette) == null ? void 0 : g.action) == null ? void 0 : y.active
        }
      },
      {
        props: {
          color: "disabled"
        },
        style: {
          color: (x = (w = (e.vars ?? e).palette) == null ? void 0 : w.action) == null ? void 0 : x.disabled
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
})), sr = /* @__PURE__ */ Xe.forwardRef(function(r, n) {
  const a = us({
    props: r,
    name: "MuiSvgIcon"
  }), {
    children: o,
    className: i,
    color: l = "inherit",
    component: c = "svg",
    fontSize: h = "medium",
    htmlColor: u,
    inheritViewBox: p = !1,
    titleAccess: g,
    viewBox: y = "0 0 24 24",
    ...w
  } = a, x = /* @__PURE__ */ Xe.isValidElement(o) && o.type === "svg", T = {
    ...a,
    color: l,
    component: c,
    fontSize: h,
    instanceFontSize: r.fontSize,
    inheritViewBox: p,
    viewBox: y,
    hasSvgAsChild: x
  }, $ = {};
  p || ($.viewBox = y);
  const N = fs(T);
  return /* @__PURE__ */ s(ps, {
    as: c,
    className: Fn(N.root, i),
    focusable: "false",
    color: u,
    "aria-hidden": g ? void 0 : !0,
    role: g ? "img" : void 0,
    ref: n,
    ...$,
    ...w,
    ...x && o.props,
    ownerState: T,
    children: [x ? o.props.children : o, g ? /* @__PURE__ */ t("title", {
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
  children: ae.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: ae.object,
  /**
   * @ignore
   */
  className: ae.string,
  /**
   * The color of the component.
   * It supports both default and custom theme colors, which can be added as shown in the
   * [palette customization guide](https://mui.com/material-ui/customization/palette/#custom-colors).
   * You can use the `htmlColor` prop to apply a color attribute to the SVG element.
   * @default 'inherit'
   */
  color: ae.oneOfType([ae.oneOf(["inherit", "action", "disabled", "primary", "secondary", "error", "info", "success", "warning"]), ae.string]),
  /**
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: ae.elementType,
  /**
   * The fontSize applied to the icon. Defaults to 24px, but can be configure to inherit font size.
   * @default 'medium'
   */
  fontSize: ae.oneOfType([ae.oneOf(["inherit", "large", "medium", "small"]), ae.string]),
  /**
   * Applies a color attribute to the SVG element.
   */
  htmlColor: ae.string,
  /**
   * If `true`, the root node will inherit the custom `component`'s viewBox and the `viewBox`
   * prop will be ignored.
   * Useful when you want to reference a custom `component` and have `SvgIcon` pass that
   * `component`'s viewBox to the root node.
   * @default false
   */
  inheritViewBox: ae.bool,
  /**
   * The shape-rendering attribute. The behavior of the different options is described on the
   * [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/shape-rendering).
   * If you are having issues with blurry icons you should investigate this prop.
   */
  shapeRendering: ae.string,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: ae.oneOfType([ae.arrayOf(ae.oneOfType([ae.func, ae.object, ae.bool])), ae.func, ae.object]),
  /**
   * Provides a human-readable title for the element that contains it.
   * https://www.w3.org/TR/SVG-access/#Equivalent
   */
  titleAccess: ae.string,
  /**
   * Allows you to redefine what the coordinates without units mean inside an SVG element.
   * For example, if the SVG element is 500 (width) by 200 (height),
   * and you pass viewBox="0 0 50 20",
   * this means that the coordinates inside the SVG will go from the top left corner (0,0)
   * to bottom right (50,20) and each unit will be worth 10px.
   * @default '0 0 24 24'
   */
  viewBox: ae.string
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
  return process.env.NODE_ENV !== "production" && (n.displayName = `${r}Icon`), n.muiName = sr.muiName, /* @__PURE__ */ Xe.memo(/* @__PURE__ */ Xe.forwardRef(n));
}
const ze = te(/* @__PURE__ */ t("path", {
  d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8z"
}), "CheckCircle"), Ee = te(/* @__PURE__ */ t("path", {
  d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m1 15h-2v-2h2zm0-4h-2V7h2z"
}), "Error"), Kt = te(/* @__PURE__ */ t("path", {
  d: "M1 21h22L12 2zm12-3h-2v-2h2zm0-4h-2v-4h2z"
}), "Warning");
async function gs(e) {
  const r = `${e}/client-manifest`, n = await fetch(r);
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
    const u = c.replace(/-./g, (p) => p[1].toUpperCase());
    o[u] || (o[u] = {}), o[u][h] = ys(
      e,
      l.method,
      l.path
    );
  }
  return o;
}
function ys(e, r, n) {
  return async (a) => {
    const o = bs(e, n, a, r), i = {
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
        const h = Or(n), u = Object.keys(a).filter((p) => !h.includes(p)).reduce((p, g) => (p[g] = a[g], p), {});
        Object.keys(u).length > 0 && (i.body = JSON.stringify(u));
      }
    const l = await fetch(o, i);
    if (!l.ok)
      throw new Error(`API request failed: ${l.status} ${l.statusText}`);
    return l.json();
  };
}
function bs(e, r, n, a) {
  let o = r;
  if (n && r.includes(":")) {
    const i = Or(r);
    for (const l of i)
      n[l] !== void 0 && (o = o.replace(`:${l}`, encodeURIComponent(n[l])));
  }
  if (a === "GET" && n) {
    const i = r.includes(":") ? Or(r) : [], l = Object.keys(n).filter((c) => !i.includes(c)).reduce((c, h) => (c[h] = n[h], c), {});
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
class vs {
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
    this.clientPromise = gs(this.baseUrl);
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
    const n = await this._fetch(`${this.baseUrl}/users/accept-invitation/${encodeURIComponent(r)}`);
    if (!n.ok) {
      const a = await n.json().catch(() => ({}));
      throw new Error(a.error || `Accept invitation failed: ${n.statusText}`);
    }
    return n.json();
  }
  async getInvitations() {
    const r = new URLSearchParams();
    r.set("status", "invited"), r.set("limit", "100");
    const n = await this._fetch(`${this.baseUrl}/users?${r}`);
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
    const i = await this._fetch(`${this.baseUrl}/bans/email/${encodeURIComponent(r)}`, {
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
    const n = await this._fetch(`${this.baseUrl}/bans/email/${encodeURIComponent(r)}`, {
      method: "DELETE"
    });
    if (!n.ok)
      throw new Error(`Unban request failed: ${n.statusText}`);
  }
  async checkBan(r) {
    const n = await this._fetch(`${this.baseUrl}/bans/email/${encodeURIComponent(r)}`);
    if (!n.ok)
      throw new Error(`Ban check failed: ${n.statusText}`);
    return { banned: (await n.json()).isBanned };
  }
  // ==================
  // Entitlements API
  // ==================
  async getEntitlements(r) {
    const n = await this._fetch(`${this.baseUrl}/entitlements/${encodeURIComponent(r)}`);
    if (!n.ok)
      throw new Error(`Entitlements request failed: ${n.statusText}`);
    return n.json();
  }
  async refreshEntitlements(r) {
    const n = await this._fetch(`${this.baseUrl}/entitlements/${encodeURIComponent(r)}/refresh`, {
      method: "POST"
    });
    if (!n.ok)
      throw new Error(`Entitlements refresh failed: ${n.statusText}`);
    return n.json();
  }
  async checkEntitlement(r, n) {
    const a = await this._fetch(
      `${this.baseUrl}/entitlements/${encodeURIComponent(r)}/check/${encodeURIComponent(n)}`
    );
    if (!a.ok)
      throw new Error(`Entitlement check failed: ${a.statusText}`);
    return a.json();
  }
  async getAvailableEntitlements() {
    const r = await this._fetch(`${this.baseUrl}/entitlements/available`);
    if (!r.ok)
      throw new Error(`Available entitlements request failed: ${r.statusText}`);
    return (await r.json()).entitlements;
  }
  async grantEntitlement(r, n) {
    const a = await this._fetch(`${this.baseUrl}/entitlements/${encodeURIComponent(r)}`, {
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
      `${this.baseUrl}/entitlements/${encodeURIComponent(r)}/${encodeURIComponent(n)}`,
      { method: "DELETE" }
    );
    if (!a.ok)
      throw new Error(`Revoke entitlement failed: ${a.statusText}`);
  }
  async invalidateEntitlementCache(r) {
    const n = await this._fetch(`${this.baseUrl}/entitlements/cache/${encodeURIComponent(r)}`, {
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
    const n = await this._fetch(`${this.baseUrl}/plugins/${encodeURIComponent(r)}`);
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
    const r = await this._fetch(`${this.baseUrl}/auth/config`, {
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
    const r = await this._fetch(`${this.baseUrl}/auth/test-current`, {
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
    const n = await this._fetch(`${this.baseUrl}/notifications/clients/${encodeURIComponent(r)}`, {
      method: "DELETE"
    });
    if (!n.ok) {
      const a = await n.json().catch(() => ({}));
      throw new Error(a.error || `Disconnect client failed: ${n.statusText}`);
    }
    return n.json();
  }
  async forceNotificationsReconnect() {
    const r = await this._fetch(`${this.baseUrl}/notifications/reconnect`, {
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
    const n = `${this.baseUrl}/preferences`, a = await this._fetch(n, {
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
    const r = `${this.baseUrl}/preferences`, n = await this._fetch(r, {
      method: "DELETE"
    });
    if (!n.ok)
      throw new Error(`Failed to delete preferences: ${n.statusText}`);
  }
}
const Y = new vs(), ia = Dn(null);
function xs({ initialWidgets: e = [], children: r }) {
  const [n, a] = f(
    e.map((h) => ({ ...h, visible: h.visible !== !1, priority: h.priority ?? 100 }))
  ), o = Se((h) => {
    a((u) => u.some((g) => g.id === h.id) ? u.map((g) => g.id === h.id ? { ...h, visible: h.visible !== !1, priority: h.priority ?? 100 } : g) : [...u, { ...h, visible: h.visible !== !1, priority: h.priority ?? 100 }]);
  }, []), i = Se((h) => {
    a((u) => u.filter((p) => p.id !== h));
  }, []), l = Se((h, u) => {
    a((p) => p.map((g) => g.id === h ? { ...g, visible: u ?? !g.visible } : g));
  }, []), c = Se(() => n.filter((h) => h.visible !== !1).sort((h, u) => (h.priority ?? 100) - (u.priority ?? 100)), [n]);
  return /* @__PURE__ */ t(ia.Provider, { value: { widgets: n, registerWidget: o, unregisterWidget: i, toggleWidget: l, getVisibleWidgets: c }, children: r });
}
function sa() {
  const e = Nn(ia);
  if (!e)
    throw new Error("useDashboardWidgets must be used within a DashboardWidgetProvider");
  return e;
}
function Bl(e) {
  const { registerWidget: r, unregisterWidget: n } = sa();
  return f(() => (r(e), null)), () => n(e.id);
}
function Cs() {
  const { getVisibleWidgets: e } = sa(), r = e();
  return r.length === 0 ? null : /* @__PURE__ */ t(Be, { children: r.map((n) => /* @__PURE__ */ s(m, { sx: { mt: 4 }, children: [
    n.title && /* @__PURE__ */ t(v, { variant: "h6", sx: { mb: 2, color: "var(--theme-text-primary)" }, children: n.title }),
    n.component
  ] }, n.id)) });
}
const la = Dn(null);
function ws({
  initialComponents: e = [],
  children: r
}) {
  const [n, a] = f(() => {
    const p = /* @__PURE__ */ new Map();
    for (const g of e)
      p.set(g.name, g.component);
    return p;
  }), o = Se((p, g) => {
    a((y) => {
      const w = new Map(y);
      return w.set(p, g), w;
    });
  }, []), i = Se((p) => {
    a((g) => {
      const y = new Map(g);
      for (const w of p)
        y.set(w.name, w.component);
      return y;
    });
  }, []), l = Se((p) => n.get(p) ?? null, [n]), c = Se((p) => n.has(p), [n]), h = Se(() => Array.from(n.keys()), [n]), u = Sa(
    () => ({
      registerComponent: o,
      registerComponents: i,
      getComponent: l,
      hasComponent: c,
      getRegisteredNames: h
    }),
    [o, i, l, c, h]
  );
  return /* @__PURE__ */ t(la.Provider, { value: u, children: r });
}
function Ss() {
  const e = Nn(la);
  if (!e)
    throw new Error("useWidgetComponentRegistry must be used within a WidgetComponentRegistryProvider");
  return e;
}
function ks({
  widgetType: e,
  defaultOnly: r = !0,
  additionalWidgetIds: n = []
}) {
  const [a, o] = f([]), [i, l] = f(!0), [c, h] = f(null), { getComponent: u, hasComponent: p } = Ss();
  if (ie(() => {
    (async () => {
      try {
        const w = await Y.getUiContributions();
        o(w.widgets || []), h(null);
      } catch (w) {
        h(w instanceof Error ? w.message : "Failed to fetch widgets");
      } finally {
        l(!1);
      }
    })();
  }, []), i)
    return /* @__PURE__ */ t(m, { sx: { display: "flex", justifyContent: "center", py: 4 }, children: /* @__PURE__ */ t(se, { size: 24 }) });
  if (c)
    return /* @__PURE__ */ t(q, { severity: "error", sx: { mt: 2 }, children: c });
  const g = a.filter((y) => e && y.type !== e ? !1 : r ? y.showByDefault || n.includes(y.id) : !0).filter((y) => p(y.component) ? !0 : (console.warn(`Widget "${y.id}" references unregistered component "${y.component}"`), !1)).sort((y, w) => (y.priority ?? 100) - (w.priority ?? 100));
  return g.length === 0 ? null : /* @__PURE__ */ t(Be, { children: g.map((y) => {
    const w = u(y.component);
    return /* @__PURE__ */ s(m, { sx: { mt: 4 }, children: [
      y.title && /* @__PURE__ */ t(v, { variant: "h6", sx: { mb: 2, color: "var(--theme-text-primary)" }, children: y.title }),
      w && /* @__PURE__ */ t(w, {})
    ] }, y.id);
  }) });
}
function Es(e) {
  switch (e) {
    case "healthy":
      return /* @__PURE__ */ t(ze, { sx: { fontSize: 24, color: "var(--theme-success)" } });
    case "degraded":
      return /* @__PURE__ */ t(Kt, { sx: { fontSize: 24, color: "var(--theme-warning)" } });
    case "unhealthy":
      return /* @__PURE__ */ t(Ee, { sx: { fontSize: 24, color: "var(--theme-error)" } });
    default:
      return /* @__PURE__ */ t(Kt, { sx: { fontSize: 24, color: "var(--theme-text-secondary)" } });
  }
}
function wn(e) {
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
function Is(e) {
  return e <= 1 ? 1 : e === 2 ? 2 : e === 3 ? 3 : 4;
}
function $s() {
  const [e, r] = f(null), [n, a] = f(null);
  if (ie(() => {
    const l = async () => {
      try {
        const h = await Y.getHealth();
        r(h), a(null);
      } catch (h) {
        a(h instanceof Error ? h.message : "Failed to fetch health");
      }
    };
    l();
    const c = setInterval(l, 1e4);
    return () => clearInterval(c);
  }, []), n)
    return /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", border: "1px solid var(--theme-error)" }, children: /* @__PURE__ */ t(j, { children: /* @__PURE__ */ t(H, { variant: "body2", customColor: "var(--theme-error)", content: n }) }) });
  const o = e ? Object.entries(e.checks) : [];
  if (o.length === 0)
    return /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(j, { children: /* @__PURE__ */ t(H, { variant: "body2", customColor: "var(--theme-text-secondary)", content: "No health checks configured" }) }) });
  const i = Is(o.length);
  return /* @__PURE__ */ t(lr, { columns: i, spacing: "medium", equalHeight: !0, children: o.map(([l, c]) => /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(j, { children: /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
    Es(c.status),
    /* @__PURE__ */ s(m, { sx: { flex: 1, minWidth: 0 }, children: [
      /* @__PURE__ */ t(
        H,
        {
          variant: "body1",
          fontWeight: "500",
          content: l.charAt(0).toUpperCase() + l.slice(1),
          customColor: "var(--theme-text-primary)"
        }
      ),
      /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", gap: 1, mt: 0.5 }, children: [
        /* @__PURE__ */ t(
          oe,
          {
            label: c.status,
            size: "small",
            sx: {
              bgcolor: wn(c.status) + "20",
              color: wn(c.status),
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
function As() {
  const [e, r] = f(null), [n, a] = f(!0), [o, i] = f(null);
  if (ie(() => {
    (async () => {
      try {
        const u = await Y.fetch("/ai-proxy/config");
        r(u);
      } catch (u) {
        i(u instanceof Error ? u.message : "Failed to fetch integrations");
      } finally {
        a(!1);
      }
    })();
  }, []), n)
    return /* @__PURE__ */ t(m, { sx: { display: "flex", justifyContent: "center", py: 2 }, children: /* @__PURE__ */ t(se, { size: 20 }) });
  if (o)
    return /* @__PURE__ */ t(q, { severity: "warning", sx: { py: 0.5, fontSize: 13 }, children: "Unable to load integrations" });
  if (!e) return null;
  const l = e.integrations.filter((h) => h.configured).length, c = e.integrations.length;
  return /* @__PURE__ */ s(
    m,
    {
      sx: {
        bgcolor: "var(--theme-surface)",
        borderRadius: 2,
        p: 2,
        border: "1px solid var(--theme-border)"
      },
      children: [
        /* @__PURE__ */ s(m, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }, children: [
          /* @__PURE__ */ s(v, { variant: "subtitle2", sx: { color: "var(--theme-text-secondary)" }, children: [
            l,
            " of ",
            c,
            " configured"
          ] }),
          /* @__PURE__ */ s(v, { variant: "subtitle2", sx: { color: "var(--theme-text-secondary)" }, children: [
            e.stats.totalRequests,
            " requests"
          ] })
        ] }),
        /* @__PURE__ */ t(m, { sx: { display: "flex", flexDirection: "column", gap: 1.5 }, children: e.integrations.map((h) => /* @__PURE__ */ s(
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
              /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                h.configured ? /* @__PURE__ */ t(ze, { sx: { color: "var(--theme-success)", fontSize: 18 } }) : /* @__PURE__ */ t(Ee, { sx: { color: "var(--theme-text-secondary)", fontSize: 18 } }),
                /* @__PURE__ */ s(m, { children: [
                  /* @__PURE__ */ t(v, { variant: "body2", sx: { color: "var(--theme-text-primary)", fontWeight: 500 }, children: h.name }),
                  /* @__PURE__ */ t(v, { variant: "caption", sx: { color: "var(--theme-text-secondary)" }, children: h.description })
                ] })
              ] }),
              /* @__PURE__ */ t(
                oe,
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
const Vr = te(/* @__PURE__ */ t("path", {
  d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2M4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12m8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8"
}), "Block"), Ts = {
  supertokens: "SuperTokens",
  auth0: "Auth0",
  supabase: "Supabase",
  basic: "Basic Auth"
};
function Ps() {
  const [e, r] = f(null), [n, a] = f(!0), [o, i] = f(null);
  if (ie(() => {
    (async () => {
      try {
        const u = await Y.getAuthConfigStatus();
        r(u);
      } catch (u) {
        i(u instanceof Error ? u.message : "Failed to fetch auth status");
      } finally {
        a(!1);
      }
    })();
  }, []), n)
    return /* @__PURE__ */ t(m, { sx: { display: "flex", justifyContent: "center", py: 2 }, children: /* @__PURE__ */ t(se, { size: 20 }) });
  if (o)
    return /* @__PURE__ */ t(q, { severity: "warning", sx: { py: 0.5, fontSize: 13 }, children: "Unable to load auth status" });
  if (!e) return null;
  const l = () => {
    switch (e.state) {
      case "enabled":
        return /* @__PURE__ */ t(ze, { sx: { color: "var(--theme-success)", fontSize: 32 } });
      case "error":
        return /* @__PURE__ */ t(Ee, { sx: { color: "var(--theme-error)", fontSize: 32 } });
      case "disabled":
      default:
        return /* @__PURE__ */ t(Vr, { sx: { color: "var(--theme-text-secondary)", fontSize: 32 } });
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
  return /* @__PURE__ */ s(
    m,
    {
      sx: {
        bgcolor: "var(--theme-surface)",
        borderRadius: 2,
        p: 2,
        border: "1px solid var(--theme-border)"
      },
      children: [
        /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
          l(),
          /* @__PURE__ */ s(m, { sx: { flex: 1 }, children: [
            /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 0.5 }, children: [
              /* @__PURE__ */ t(v, { variant: "subtitle1", sx: { color: "var(--theme-text-primary)", fontWeight: 600 }, children: e.state === "enabled" && e.adapter ? Ts[e.adapter] || e.adapter : e.state === "disabled" ? "Not Configured" : "Configuration Error" }),
              /* @__PURE__ */ t(
                oe,
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
            /* @__PURE__ */ t(v, { variant: "body2", sx: { color: "var(--theme-text-secondary)" }, children: e.state === "enabled" ? "Authentication is active" : e.state === "disabled" ? "Set AUTH_ADAPTER environment variable" : e.error || "Check configuration" })
          ] })
        ] }),
        e.missingVars && e.missingVars.length > 0 && /* @__PURE__ */ s(q, { severity: "warning", sx: { mt: 2, py: 0.5, "& .MuiAlert-message": { fontSize: 12 } }, children: [
          "Missing: ",
          e.missingVars.join(", ")
        ] })
      ]
    }
  );
}
const Ds = te(/* @__PURE__ */ t("path", {
  d: "m1 9 2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9m8 8 3 3 3-3c-1.65-1.66-4.34-1.66-6 0m-4-4 2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13"
}), "Wifi"), Sn = te(/* @__PURE__ */ t("path", {
  d: "M22.99 9C19.15 5.16 13.8 3.76 8.84 4.78l2.52 2.52c3.47-.17 6.99 1.05 9.63 3.7zm-4 4c-1.29-1.29-2.84-2.13-4.49-2.56l3.53 3.53zM2 3.05 5.07 6.1C3.6 6.82 2.22 7.78 1 9l1.99 2c1.24-1.24 2.67-2.16 4.2-2.77l2.24 2.24C7.81 10.89 6.27 11.73 5 13v.01L6.99 15c1.36-1.36 3.14-2.04 4.92-2.06L18.98 20l1.27-1.26L3.29 1.79zM9 17l3 3 3-3c-1.65-1.66-4.34-1.66-6 0"
}), "WifiOff"), Ns = te(/* @__PURE__ */ t("path", {
  d: "M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1m-1 9h-4v-7h4z"
}), "Devices"), ca = te(/* @__PURE__ */ t("path", {
  d: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4"
}), "Person"), zs = te(/* @__PURE__ */ t("path", {
  d: "M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"
}), "Send");
function $r(e) {
  return e >= 1e6 ? `${(e / 1e6).toFixed(1)}M` : e >= 1e3 ? `${(e / 1e3).toFixed(1)}K` : e.toString();
}
function _s(e) {
  return e < 1e3 ? `${e}ms` : e < 6e4 ? `${(e / 1e3).toFixed(0)}s` : e < 36e5 ? `${(e / 6e4).toFixed(0)}m` : `${(e / 36e5).toFixed(1)}h`;
}
function Os() {
  const [e, r] = f(null), [n, a] = f(null), [o, i] = f(!0);
  if (ie(() => {
    const h = async () => {
      try {
        const p = await Y.getNotificationsStats();
        r(p), a(null);
      } catch (p) {
        p instanceof Error && p.message.includes("404") ? a("Notifications plugin not enabled") : a(p instanceof Error ? p.message : "Failed to fetch stats");
      } finally {
        i(!1);
      }
    };
    h();
    const u = setInterval(h, 5e3);
    return () => clearInterval(u);
  }, []), o)
    return /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(j, { children: /* @__PURE__ */ t(Gt, {}) }) });
  if (n)
    return /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", border: "1px solid var(--theme-border)" }, children: /* @__PURE__ */ t(j, { children: /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
      /* @__PURE__ */ t(Sn, { sx: { color: "var(--theme-text-secondary)" } }),
      /* @__PURE__ */ t(H, { variant: "body2", customColor: "var(--theme-text-secondary)", content: n })
    ] }) }) });
  if (!e)
    return null;
  const l = e.connectionHealth.isHealthy, c = l ? "var(--theme-success)" : "var(--theme-warning)";
  return /* @__PURE__ */ s(m, { children: [
    /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", mb: 2 }, children: /* @__PURE__ */ t(j, { sx: { py: 1, "&:last-child": { pb: 1 } }, children: /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
      /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
        l ? /* @__PURE__ */ t(Ds, { sx: { color: c, fontSize: 20 } }) : /* @__PURE__ */ t(Sn, { sx: { color: c, fontSize: 20 } }),
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
          oe,
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
      /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
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
            content: `Last event: ${_s(e.connectionHealth.timeSinceLastEvent)} ago`,
            customColor: "var(--theme-text-secondary)"
          }
        )
      ] })
    ] }) }) }),
    /* @__PURE__ */ s(lr, { columns: 4, spacing: "small", equalHeight: !0, children: [
      /* @__PURE__ */ t(
        Wt,
        {
          icon: /* @__PURE__ */ t(Ns, { sx: { fontSize: 28 } }),
          label: "Active Clients",
          value: e.currentConnections,
          subValue: `${e.totalConnections} total`,
          color: "var(--theme-primary)"
        }
      ),
      /* @__PURE__ */ t(
        Wt,
        {
          icon: /* @__PURE__ */ t(ca, { sx: { fontSize: 28 } }),
          label: "By Device",
          value: e.clientsByType.device,
          subValue: `${e.clientsByType.user} by user`,
          color: "var(--theme-info)"
        }
      ),
      /* @__PURE__ */ t(
        Wt,
        {
          icon: /* @__PURE__ */ t(zs, { sx: { fontSize: 28 } }),
          label: "Events Routed",
          value: $r(e.eventsRouted),
          subValue: `${$r(e.eventsProcessed)} processed`,
          color: "var(--theme-success)"
        }
      ),
      /* @__PURE__ */ t(
        Wt,
        {
          icon: /* @__PURE__ */ t(Ee, { sx: { fontSize: 28 } }),
          label: "Dropped",
          value: $r(e.eventsDroppedNoClients),
          subValue: `${e.eventsParseFailed} parse errors`,
          color: e.eventsDroppedNoClients > 0 ? "var(--theme-warning)" : "var(--theme-text-secondary)"
        }
      )
    ] })
  ] });
}
const Bs = te(/* @__PURE__ */ t("path", {
  d: "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1M8 13h8v-2H8zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5"
}), "Link");
function Ms() {
  const [e, r] = f(null), [n, a] = f(!0), [o, i] = f(null), l = async () => {
    try {
      const p = window.__API_BASE_PATH__ || "", g = await fetch(`${p}/cms/status`);
      if (!g.ok)
        throw new Error(`HTTP ${g.status}: ${g.statusText}`);
      const y = await g.json();
      r(y), i(null);
    } catch (p) {
      i(p instanceof Error ? p.message : "Failed to fetch CMS status");
    } finally {
      a(!1);
    }
  };
  if (ie(() => {
    l();
    const p = setInterval(l, 3e4);
    return () => clearInterval(p);
  }, []), n)
    return /* @__PURE__ */ t(F, { children: /* @__PURE__ */ t(j, { children: /* @__PURE__ */ t(m, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100px", children: /* @__PURE__ */ t(se, { size: 24 }) }) }) });
  if (o || !e)
    return /* @__PURE__ */ t(F, { children: /* @__PURE__ */ t(j, { children: /* @__PURE__ */ t(q, { severity: "error", children: o || "Failed to load CMS status" }) }) });
  const c = e.status === "running", h = c ? "success" : e.status === "unhealthy" ? "warning" : "error", u = c ? ze : Ee;
  return /* @__PURE__ */ t(F, { children: /* @__PURE__ */ s(j, { children: [
    /* @__PURE__ */ s(m, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, children: [
      /* @__PURE__ */ t(v, { variant: "h6", children: "Payload CMS" }),
      /* @__PURE__ */ t(
        oe,
        {
          label: e.status.toUpperCase(),
          color: h,
          size: "small",
          icon: /* @__PURE__ */ t(u, {})
        }
      )
    ] }),
    /* @__PURE__ */ s(m, { display: "flex", flexDirection: "column", gap: 1, children: [
      /* @__PURE__ */ s(m, { display: "flex", alignItems: "center", gap: 1, children: [
        /* @__PURE__ */ t(Bs, { fontSize: "small", color: "action" }),
        /* @__PURE__ */ t(v, { variant: "body2", color: "text.secondary", children: e.url })
      ] }),
      e.error && /* @__PURE__ */ t(q, { severity: "error", sx: { mt: 1 }, children: e.error }),
      /* @__PURE__ */ s(v, { variant: "caption", color: "text.secondary", sx: { mt: 1 }, children: [
        "Last checked: ",
        new Date(e.timestamp).toLocaleTimeString()
      ] })
    ] })
  ] }) });
}
const mt = te(/* @__PURE__ */ t("path", {
  d: "M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z"
}), "Refresh"), ft = te(/* @__PURE__ */ t("path", {
  d: "M8 5v14l11-7z"
}), "PlayArrow");
function Rs() {
  const [e, r] = f(null), [n, a] = f([]), [o, i] = f(!0), [l, c] = f(null), [h, u] = f(null), [p, g] = f(null), y = async () => {
    try {
      const I = window.__API_BASE_PATH__ || "", b = await fetch(`${I}/cms/status`);
      if (!b.ok)
        throw new Error(`HTTP ${b.status}: ${b.statusText}`);
      const k = await b.json();
      r(k);
    } catch (I) {
      console.error("Failed to fetch CMS status:", I);
    }
  }, w = async () => {
    try {
      const I = window.__API_BASE_PATH__ || "", b = await fetch(`${I}/cms/seeds`);
      if (!b.ok)
        throw new Error(`HTTP ${b.status}: ${b.statusText}`);
      const k = await b.json();
      a(k.seeds || []);
    } catch (I) {
      console.error("Failed to fetch seeds:", I);
    } finally {
      i(!1);
    }
  };
  ie(() => {
    y(), w();
    const I = setInterval(y, 3e4);
    return () => clearInterval(I);
  }, []);
  const x = async () => {
    u(null), g(null);
    try {
      const I = window.__API_BASE_PATH__ || "", b = await fetch(`${I}/cms/restart`, { method: "POST" }), k = await b.json();
      b.ok ? (g("CMS service restarted successfully"), setTimeout(() => y(), 2e3)) : u(k.message || "Restart not implemented");
    } catch (I) {
      u(I instanceof Error ? I.message : "Failed to restart CMS");
    }
  }, T = async (I) => {
    c(I), u(null), g(null);
    try {
      const b = window.__API_BASE_PATH__ || "", k = await fetch(`${b}/cms/seeds/${I}/execute`, {
        method: "POST"
      });
      if (!k.ok)
        throw new Error(`HTTP ${k.status}: ${k.statusText}`);
      const D = await k.json();
      D.success ? g(`Seed "${I}" executed successfully`) : u(D.error || "Seed execution failed");
    } catch (b) {
      u(b instanceof Error ? b.message : "Failed to execute seed");
    } finally {
      c(null);
    }
  };
  if (o)
    return /* @__PURE__ */ t(F, { children: /* @__PURE__ */ t(j, { children: /* @__PURE__ */ t(m, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px", children: /* @__PURE__ */ t(se, {}) }) }) });
  const $ = (e == null ? void 0 : e.status) === "running", N = $ ? "success" : (e == null ? void 0 : e.status) === "unhealthy" ? "warning" : "error", O = $ ? ze : Ee;
  return /* @__PURE__ */ t(F, { children: /* @__PURE__ */ s(j, { children: [
    /* @__PURE__ */ s(m, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, children: [
      /* @__PURE__ */ t(v, { variant: "h6", children: "CMS Service Control" }),
      e && /* @__PURE__ */ t(
        oe,
        {
          label: e.status.toUpperCase(),
          color: N,
          size: "small",
          icon: /* @__PURE__ */ t(O, {})
        }
      )
    ] }),
    h && /* @__PURE__ */ t(q, { severity: "error", sx: { mb: 2 }, onClose: () => u(null), children: h }),
    p && /* @__PURE__ */ t(q, { severity: "success", sx: { mb: 2 }, onClose: () => g(null), children: p }),
    /* @__PURE__ */ s(m, { mb: 3, children: [
      /* @__PURE__ */ t(v, { variant: "subtitle2", gutterBottom: !0, children: "Service Control" }),
      /* @__PURE__ */ t(v, { variant: "body2", color: "text.secondary", mb: 2, children: "Manage the Payload CMS service" }),
      /* @__PURE__ */ t(
        re,
        {
          variant: "outlined",
          startIcon: /* @__PURE__ */ t(mt, {}),
          onClick: x,
          disabled: !e,
          children: "Restart CMS Service"
        }
      )
    ] }),
    /* @__PURE__ */ t(_n, { sx: { my: 2 } }),
    /* @__PURE__ */ s(m, { children: [
      /* @__PURE__ */ s(m, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, children: [
        /* @__PURE__ */ t(v, { variant: "subtitle2", children: "Seed Scripts" }),
        /* @__PURE__ */ t(Me, { size: "small", onClick: w, children: /* @__PURE__ */ t(mt, { fontSize: "small" }) })
      ] }),
      /* @__PURE__ */ t(v, { variant: "body2", color: "text.secondary", mb: 2, children: "Execute database seed scripts for initial data setup" }),
      n.length > 0 ? /* @__PURE__ */ t(On, { dense: !0, children: n.map((I) => /* @__PURE__ */ t(
        Bn,
        {
          secondaryAction: /* @__PURE__ */ t(
            re,
            {
              variant: "outlined",
              size: "small",
              startIcon: l === I.name ? /* @__PURE__ */ t(se, { size: 16 }) : /* @__PURE__ */ t(ft, {}),
              onClick: () => T(I.name),
              disabled: l !== null,
              children: l === I.name ? "Running..." : "Run"
            }
          ),
          children: /* @__PURE__ */ t(
            Mn,
            {
              primary: I.name,
              secondary: I.file
            }
          )
        },
        I.name
      )) }) : /* @__PURE__ */ t(q, { severity: "info", children: "No seed scripts found. Place seed scripts in the configured seeds directory." })
    ] })
  ] }) });
}
const da = te(/* @__PURE__ */ t("path", {
  d: "M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z"
}), "ExpandMore"), Ls = te(/* @__PURE__ */ t("path", {
  d: "M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8z"
}), "Folder"), Ws = te(/* @__PURE__ */ t("path", {
  d: "M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
}), "Close");
function js() {
  const [e, r] = f([]), [n, a] = f(!0), [o, i] = f(null), [l, c] = f(!1), [h, u] = f(/* @__PURE__ */ new Set()), [p, g] = f(!1), [y, w] = f([]), [x, T] = f(null), [$, N] = f(!1), [O, I] = f(""), [b, k] = f("success"), [D, U] = f(!1), [M, B] = f(!1);
  ie(() => {
    de();
  }, []);
  const de = async () => {
    try {
      const W = window.__API_BASE_PATH__ || "", J = await fetch(`${W}/maintenance/seeds/discover`);
      if (!J.ok) throw new Error("Failed to fetch seeds");
      const Q = await J.json();
      r(Q.seeds || []), i(null);
    } catch (W) {
      i(W instanceof Error ? W.message : "Failed to fetch seeds");
    } finally {
      a(!1);
    }
  }, L = (W) => W.type === "file" ? W.path : W.id, d = (W) => W.type === "task" ? W.name : W.name.replace(".mjs", "").replace(/^\d+\./, "").split(/[-_]/).map((Z) => Z.charAt(0).toUpperCase() + Z.slice(1)).join(" "), z = () => {
    const W = /* @__PURE__ */ new Map();
    return e.forEach((J) => {
      let Q = "Ungrouped";
      if (J.type === "file" && J.path) {
        const Z = J.path.split("/");
        Z.length > 1 && (Q = Z[0]);
      }
      W.has(Q) || W.set(Q, []), W.get(Q).push(J);
    }), Array.from(W.entries()).map(([J, Q]) => ({ name: J, seeds: Q })).sort((J, Q) => J.name.localeCompare(Q.name, void 0, { numeric: !0 }));
  }, C = (W) => {
    const J = new Set(h);
    J.has(W) ? J.delete(W) : J.add(W), u(J);
  }, R = (W) => {
    const J = W.seeds.map(L), Q = J.every((P) => h.has(P)), Z = new Set(h);
    Q ? J.forEach((P) => Z.delete(P)) : J.forEach((P) => Z.add(P)), u(Z);
  }, V = async (W, J, Q) => {
    var ot, pt;
    const Z = window.__API_BASE_PATH__ || "", P = await fetch(`${Z}/maintenance/seeds/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: W, type: Q })
    });
    if (!P.ok && !((ot = P.headers.get("content-type")) != null && ot.includes("text/event-stream"))) {
      const Fe = await P.json().catch(() => ({ error: "Failed to start execution" }));
      throw new Error(Fe.error || "Failed to start execution");
    }
    const ye = (pt = P.body) == null ? void 0 : pt.getReader(), Ce = new TextDecoder();
    let ne = "", xe = "", _e = 1;
    if (ye)
      try {
        for (; ; ) {
          const { done: Fe, value: Ke } = await ye.read();
          if (Fe) break;
          const st = Ce.decode(Ke, { stream: !0 }).split(`
`);
          for (const Le of st)
            if (Le.startsWith("data: "))
              try {
                const Ie = JSON.parse(Le.slice(6));
                Ie.type === "stdout" ? ne += Ie.data : Ie.type === "stderr" ? xe += Ie.data : Ie.type === "exit" && (_e = JSON.parse(Ie.data).exitCode);
              } catch {
              }
        }
      } finally {
        ye.releaseLock();
      }
    return {
      seedName: J,
      success: _e === 0,
      output: ne || void 0,
      error: xe || (_e !== 0 ? "Execution failed" : void 0)
    };
  }, he = async () => {
    B(!0), U(!1);
    try {
      const W = window.__API_BASE_PATH__ || "", J = await fetch(`${W}/maintenance/database/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      }), Q = await J.json();
      if (!J.ok)
        throw new Error(Q.error || "Failed to reset database");
      I("Database reset successfully. All tables and data have been deleted."), k("success"), N(!0), await de();
    } catch (W) {
      I(W instanceof Error ? W.message : "Database reset failed"), k("error"), N(!0);
    } finally {
      B(!1);
    }
  }, G = async () => {
    if (h.size === 0) return;
    c(!0), g(!0), w([]);
    const W = e.filter((P) => h.has(L(P))), J = [];
    for (const P of W) {
      const ye = L(P), Ce = d(P);
      T(Ce);
      try {
        const ne = await V(ye, Ce, P.type);
        J.push(ne);
      } catch (ne) {
        J.push({
          seedName: Ce,
          success: !1,
          error: ne instanceof Error ? ne.message : "Unknown error"
        });
      }
      w([...J]);
    }
    T(null), c(!1);
    const Q = J.filter((P) => P.success).length, Z = J.length - Q;
    Z === 0 ? (I(`Successfully executed ${Q} seed${Q > 1 ? "s" : ""}`), k("success"), u(/* @__PURE__ */ new Set()), await de()) : (I(`Completed with ${Z} error${Z > 1 ? "s" : ""}`), k("error")), N(!0);
  };
  if (n)
    return /* @__PURE__ */ t(F, { children: /* @__PURE__ */ t(j, { children: /* @__PURE__ */ t(m, { sx: { display: "flex", justifyContent: "center", py: 2 }, children: /* @__PURE__ */ t(se, { size: 24 }) }) }) });
  const ve = z();
  return /* @__PURE__ */ s(Be, { children: [
    /* @__PURE__ */ t(F, { children: /* @__PURE__ */ s(j, { children: [
      /* @__PURE__ */ s(m, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }, children: [
        /* @__PURE__ */ s(m, { children: [
          /* @__PURE__ */ t(v, { variant: "h6", children: "Seed Management" }),
          /* @__PURE__ */ t(v, { variant: "body2", color: "text.secondary", children: "Manage and execute seed scripts" })
        ] }),
        /* @__PURE__ */ s(m, { sx: { display: "flex", gap: 1 }, children: [
          h.size > 0 && /* @__PURE__ */ s(
            re,
            {
              variant: "contained",
              color: "primary",
              startIcon: l ? /* @__PURE__ */ t(se, { size: 16 }) : /* @__PURE__ */ t(ft, {}),
              onClick: G,
              disabled: l || M,
              children: [
                "Run Selected (",
                h.size,
                ")"
              ]
            }
          ),
          /* @__PURE__ */ t(
            re,
            {
              variant: "outlined",
              color: "error",
              onClick: () => U(!0),
              disabled: l || M,
              children: "Reset Database"
            }
          )
        ] })
      ] }),
      o && /* @__PURE__ */ t(q, { severity: "error", sx: { mb: 2 }, children: o }),
      e.length === 0 ? /* @__PURE__ */ t(q, { severity: "info", children: "No seed scripts found" }) : /* @__PURE__ */ t(m, { children: ve.map((W) => {
        const J = W.seeds.map(L), Q = J.every((P) => h.has(P)), Z = J.some((P) => h.has(P));
        return /* @__PURE__ */ s(Ia, { defaultExpanded: !0, children: [
          /* @__PURE__ */ t($a, { expandIcon: /* @__PURE__ */ t(da, {}), children: /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", gap: 1, width: "100%" }, children: [
            /* @__PURE__ */ t(
              Zr,
              {
                checked: Q,
                indeterminate: Z && !Q,
                onClick: (P) => {
                  P.stopPropagation(), R(W);
                }
              }
            ),
            /* @__PURE__ */ t(Ls, { color: "primary" }),
            /* @__PURE__ */ t(v, { variant: "subtitle1", sx: { flexGrow: 1 }, children: W.name }),
            /* @__PURE__ */ t(oe, { label: `${W.seeds.length} seed${W.seeds.length > 1 ? "s" : ""}`, size: "small" })
          ] }) }),
          /* @__PURE__ */ t(Aa, { children: /* @__PURE__ */ t(On, { dense: !0, children: W.seeds.map((P) => {
            const ye = L(P), Ce = h.has(ye);
            return /* @__PURE__ */ t(
              Bn,
              {
                disablePadding: !0,
                secondaryAction: /* @__PURE__ */ t(
                  re,
                  {
                    variant: "outlined",
                    size: "small",
                    startIcon: /* @__PURE__ */ t(ft, {}),
                    onClick: async () => {
                      const ne = d(P);
                      c(!0), g(!0), w([]), T(ne);
                      try {
                        const xe = await V(ye, ne, P.type);
                        w([xe]), xe.success ? (I(`${ne} executed successfully`), k("success"), await de()) : (I(`${ne} execution failed`), k("error"));
                      } catch (xe) {
                        w([{
                          seedName: ne,
                          success: !1,
                          error: xe instanceof Error ? xe.message : "Unknown error"
                        }]), I(`${ne} execution failed`), k("error");
                      } finally {
                        T(null), c(!1), N(!0);
                      }
                    },
                    disabled: l,
                    children: "Run"
                  }
                ),
                children: /* @__PURE__ */ s(Ta, { onClick: () => C(ye), children: [
                  /* @__PURE__ */ t(Pa, { children: /* @__PURE__ */ t(
                    Zr,
                    {
                      edge: "start",
                      checked: Ce,
                      tabIndex: -1,
                      disableRipple: !0
                    }
                  ) }),
                  /* @__PURE__ */ t(
                    Mn,
                    {
                      primary: d(P),
                      secondary: P.description || P.name
                    }
                  )
                ] })
              },
              ye
            );
          }) }) })
        ] }, W.name);
      }) })
    ] }) }),
    /* @__PURE__ */ s(
      Ze,
      {
        open: p,
        onClose: () => !l && g(!1),
        maxWidth: "md",
        fullWidth: !0,
        children: [
          /* @__PURE__ */ s(et, { children: [
            "Seed Execution",
            !l && /* @__PURE__ */ t(
              re,
              {
                onClick: () => g(!1),
                sx: { position: "absolute", right: 8, top: 8 },
                size: "small",
                children: /* @__PURE__ */ t(Ws, {})
              }
            )
          ] }),
          /* @__PURE__ */ s(tt, { children: [
            l && x && /* @__PURE__ */ s(m, { sx: { mb: 2 }, children: [
              /* @__PURE__ */ s(v, { variant: "body2", color: "text.secondary", gutterBottom: !0, children: [
                "Currently executing: ",
                x
              ] }),
              /* @__PURE__ */ t(Gt, {})
            ] }),
            y.length > 0 && /* @__PURE__ */ t(m, { children: y.map((W, J) => /* @__PURE__ */ s(
              Zt,
              {
                sx: {
                  p: 2,
                  mb: 1,
                  backgroundColor: W.success ? "success.dark" : "error.dark",
                  color: "white"
                },
                children: [
                  /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 1 }, children: [
                    W.success ? /* @__PURE__ */ t(ze, { color: "inherit" }) : /* @__PURE__ */ t(Ee, { color: "inherit" }),
                    /* @__PURE__ */ t(v, { variant: "subtitle2", fontWeight: "bold", children: W.seedName })
                  ] }),
                  W.output && /* @__PURE__ */ t(v, { variant: "body2", sx: { whiteSpace: "pre-wrap", fontFamily: "monospace" }, children: W.output }),
                  W.error && /* @__PURE__ */ t(v, { variant: "body2", sx: { whiteSpace: "pre-wrap", fontFamily: "monospace" }, children: W.error })
                ]
              },
              J
            )) })
          ] }),
          /* @__PURE__ */ t(rt, { children: /* @__PURE__ */ t(re, { onClick: () => g(!1), disabled: l, children: "Close" }) })
        ]
      }
    ),
    /* @__PURE__ */ s(
      Ze,
      {
        open: D,
        onClose: () => !M && U(!1),
        maxWidth: "sm",
        fullWidth: !0,
        children: [
          /* @__PURE__ */ t(et, { sx: { color: "error.main" }, children: "Reset Database?" }),
          /* @__PURE__ */ s(tt, { children: [
            /* @__PURE__ */ t(q, { severity: "warning", sx: { mb: 2 }, children: "This action cannot be undone!" }),
            /* @__PURE__ */ t(v, { variant: "body1", gutterBottom: !0, children: "This will permanently delete:" }),
            /* @__PURE__ */ s(m, { component: "ul", sx: { pl: 2 }, children: [
              /* @__PURE__ */ t("li", { children: "All database tables" }),
              /* @__PURE__ */ t("li", { children: "All stored data" }),
              /* @__PURE__ */ t("li", { children: "All seed execution history" }),
              /* @__PURE__ */ t("li", { children: "All application content" })
            ] }),
            /* @__PURE__ */ t(v, { variant: "body2", color: "text.secondary", sx: { mt: 2 }, children: "You will need to run the database initialization seeds again to recreate the schema." })
          ] }),
          /* @__PURE__ */ s(rt, { children: [
            /* @__PURE__ */ t(re, { onClick: () => U(!1), disabled: M, children: "Cancel" }),
            /* @__PURE__ */ t(
              re,
              {
                onClick: he,
                color: "error",
                variant: "contained",
                disabled: M,
                startIcon: M ? /* @__PURE__ */ t(se, { size: 16 }) : void 0,
                children: M ? "Resetting..." : "Reset Database"
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ t(
      Rn,
      {
        open: $,
        autoHideDuration: 6e3,
        onClose: () => N(!1),
        anchorOrigin: { vertical: "bottom", horizontal: "right" },
        children: /* @__PURE__ */ t(
          q,
          {
            onClose: () => N(!1),
            severity: b,
            sx: { width: "100%" },
            children: O
          }
        )
      }
    )
  ] });
}
const Fs = te(/* @__PURE__ */ t("path", {
  d: "M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9m-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8z"
}), "History");
function Us() {
  const [e, r] = f(null), [n, a] = f(!1), [o, i] = f(""), [l, c] = f([]), [h, u] = f(!0), [p, g] = f(!1), [y, w] = f(null), [x] = f(10);
  ie(() => {
    T();
  }, []);
  const T = async () => {
    try {
      u(!0);
      const k = window.__API_BASE_PATH__ || "", D = await fetch(`${k}/maintenance/migrations/history?limit=${x}`);
      if (!D.ok) throw new Error("Failed to fetch migration history");
      const U = await D.json();
      c(U.executions || []);
    } catch (k) {
      console.error("Failed to fetch migration history:", k);
    } finally {
      u(!1);
    }
  }, $ = async () => {
    a(!0), i(`Starting migrations...
`), r(null);
    try {
      const k = window.__API_BASE_PATH__ || "", D = new EventSource(`${k}/maintenance/migrations/execute`, {
        withCredentials: !0
      });
      D.addEventListener("message", (U) => {
        try {
          const M = JSON.parse(U.data);
          M.type === "output" ? i((B) => B + M.data) : M.type === "error" ? i((B) => B + "[ERROR] " + M.data) : M.type === "complete" && (i((B) => B + `

✓ Migrations completed in ${M.duration}ms (exit code: ${M.exitCode})`), a(!1), D.close(), T());
        } catch (M) {
          console.error("Failed to parse SSE message:", M);
        }
      }), D.onerror = (U) => {
        console.error("SSE error:", U), r("Connection lost or migration failed. Check console for details."), a(!1), D.close();
      };
    } catch (k) {
      r(k instanceof Error ? k.message : "Migration execution failed"), a(!1);
    }
  }, N = (k) => new Date(k).toLocaleString(), O = (k) => k ? k < 1e3 ? `${k}ms` : `${(k / 1e3).toFixed(2)}s` : "-", I = (k) => {
    switch (k) {
      case "completed":
        return /* @__PURE__ */ t(oe, { label: "Success", color: "success", size: "small", icon: /* @__PURE__ */ t(ze, {}) });
      case "failed":
        return /* @__PURE__ */ t(oe, { label: "Failed", color: "error", size: "small", icon: /* @__PURE__ */ t(Ee, {}) });
      case "running":
        return /* @__PURE__ */ t(oe, { label: "Running", color: "primary", size: "small" });
      default:
        return /* @__PURE__ */ t(oe, { label: k, size: "small" });
    }
  }, b = (k) => {
    w(k), g(!0);
  };
  return /* @__PURE__ */ s(Be, { children: [
    /* @__PURE__ */ t(F, { children: /* @__PURE__ */ s(j, { children: [
      /* @__PURE__ */ t(v, { variant: "h6", gutterBottom: !0, children: "Database Migrations" }),
      /* @__PURE__ */ t(v, { variant: "body2", color: "text.secondary", gutterBottom: !0, children: "Execute Payload CMS database schema migrations" }),
      e && /* @__PURE__ */ t(q, { severity: "error", sx: { mt: 2, mb: 2 }, children: e }),
      /* @__PURE__ */ t(m, { sx: { mt: 2, mb: 2 }, children: /* @__PURE__ */ t(
        re,
        {
          variant: "contained",
          color: "primary",
          onClick: $,
          disabled: n,
          startIcon: n ? /* @__PURE__ */ t(se, { size: 20 }) : /* @__PURE__ */ t(ft, {}),
          fullWidth: !0,
          children: n ? "Running Migrations..." : "Run Migrations"
        }
      ) }),
      o && /* @__PURE__ */ t(
        Zt,
        {
          elevation: 0,
          sx: {
            p: 2,
            bgcolor: "#1e1e1e",
            color: "#d4d4d4",
            fontFamily: "monospace",
            fontSize: "0.875rem",
            maxHeight: "400px",
            overflow: "auto",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word"
          },
          children: o
        }
      ),
      /* @__PURE__ */ s(v, { variant: "h6", sx: { mt: 4, mb: 2 }, children: [
        /* @__PURE__ */ t(Fs, { sx: { mr: 1, verticalAlign: "middle" } }),
        "Recent Executions"
      ] }),
      h ? /* @__PURE__ */ t(m, { sx: { display: "flex", justifyContent: "center", p: 3 }, children: /* @__PURE__ */ t(se, {}) }) : l.length === 0 ? /* @__PURE__ */ t(q, { severity: "info", children: "No migration executions yet" }) : /* @__PURE__ */ t(qe, { component: Zt, variant: "outlined", children: /* @__PURE__ */ s(Je, { size: "small", children: [
        /* @__PURE__ */ t(Qe, { children: /* @__PURE__ */ s(be, { children: [
          /* @__PURE__ */ t(_, { children: "Status" }),
          /* @__PURE__ */ t(_, { children: "Started" }),
          /* @__PURE__ */ t(_, { children: "Duration" }),
          /* @__PURE__ */ t(_, { children: "Exit Code" }),
          /* @__PURE__ */ t(_, { align: "right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ t(Ye, { children: l.map((k) => /* @__PURE__ */ s(be, { children: [
          /* @__PURE__ */ t(_, { children: I(k.status) }),
          /* @__PURE__ */ t(_, { children: N(k.started_at) }),
          /* @__PURE__ */ t(_, { children: O(k.duration_ms) }),
          /* @__PURE__ */ t(_, { children: k.exit_code ?? "-" }),
          /* @__PURE__ */ t(_, { align: "right", children: /* @__PURE__ */ t(
            re,
            {
              size: "small",
              onClick: () => b(k),
              children: "View Details"
            }
          ) })
        ] }, k.id)) })
      ] }) })
    ] }) }),
    /* @__PURE__ */ s(
      Ze,
      {
        open: p,
        onClose: () => g(!1),
        maxWidth: "md",
        fullWidth: !0,
        children: [
          /* @__PURE__ */ t(et, { children: "Migration Execution Details" }),
          /* @__PURE__ */ t(tt, { children: y && /* @__PURE__ */ s(Be, { children: [
            /* @__PURE__ */ s(m, { sx: { mb: 2 }, children: [
              /* @__PURE__ */ t(v, { variant: "subtitle2", children: "Status:" }),
              I(y.status)
            ] }),
            /* @__PURE__ */ s(m, { sx: { mb: 2 }, children: [
              /* @__PURE__ */ t(v, { variant: "subtitle2", children: "Started:" }),
              /* @__PURE__ */ t(v, { variant: "body2", children: N(y.started_at) })
            ] }),
            y.completed_at && /* @__PURE__ */ s(m, { sx: { mb: 2 }, children: [
              /* @__PURE__ */ t(v, { variant: "subtitle2", children: "Completed:" }),
              /* @__PURE__ */ t(v, { variant: "body2", children: N(y.completed_at) })
            ] }),
            /* @__PURE__ */ s(m, { sx: { mb: 2 }, children: [
              /* @__PURE__ */ t(v, { variant: "subtitle2", children: "Duration:" }),
              /* @__PURE__ */ t(v, { variant: "body2", children: O(y.duration_ms) })
            ] }),
            /* @__PURE__ */ s(m, { sx: { mb: 2 }, children: [
              /* @__PURE__ */ t(v, { variant: "subtitle2", children: "Exit Code:" }),
              /* @__PURE__ */ t(v, { variant: "body2", children: y.exit_code ?? "N/A" })
            ] }),
            y.output && /* @__PURE__ */ s(m, { sx: { mb: 2 }, children: [
              /* @__PURE__ */ t(v, { variant: "subtitle2", children: "Output:" }),
              /* @__PURE__ */ t(
                Zt,
                {
                  elevation: 0,
                  sx: {
                    p: 2,
                    bgcolor: "#1e1e1e",
                    color: "#d4d4d4",
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                    maxHeight: "300px",
                    overflow: "auto",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word"
                  },
                  children: y.output
                }
              )
            ] }),
            y.error && /* @__PURE__ */ s(m, { sx: { mb: 2 }, children: [
              /* @__PURE__ */ t(v, { variant: "subtitle2", children: "Error:" }),
              /* @__PURE__ */ t(q, { severity: "error", children: /* @__PURE__ */ t("pre", { style: { margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }, children: y.error }) })
            ] })
          ] }) }),
          /* @__PURE__ */ t(rt, { children: /* @__PURE__ */ t(re, { onClick: () => g(!1), children: "Close" }) })
        ]
      }
    )
  ] });
}
function Vs() {
  return /* @__PURE__ */ t(F, { children: /* @__PURE__ */ s(j, { children: [
    /* @__PURE__ */ t(v, { variant: "h6", gutterBottom: !0, children: "Service Control" }),
    /* @__PURE__ */ t(v, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Start, stop, and restart services" }),
    /* @__PURE__ */ t(q, { severity: "info", children: "Service control functionality coming soon. This will allow you to manage service lifecycle." })
  ] }) });
}
function Hs() {
  return /* @__PURE__ */ t(F, { children: /* @__PURE__ */ s(j, { children: [
    /* @__PURE__ */ t(v, { variant: "h6", gutterBottom: !0, children: "Environment Configuration" }),
    /* @__PURE__ */ t(v, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "View and manage environment variables" }),
    /* @__PURE__ */ t(q, { severity: "info", children: "Environment configuration UI coming soon. This will allow you to view and edit environment variables." })
  ] }) });
}
function Ks() {
  return /* @__PURE__ */ t(F, { children: /* @__PURE__ */ s(j, { children: [
    /* @__PURE__ */ t(v, { variant: "h6", gutterBottom: !0, children: "Database Operations" }),
    /* @__PURE__ */ t(v, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Backup, restore, and maintain database" }),
    /* @__PURE__ */ t(q, { severity: "info", children: "Database operations UI coming soon. This will allow you to backup and restore your database." })
  ] }) });
}
const Gs = ({
  open: e,
  title: r,
  message: n,
  confirmText: a,
  requiredInput: o,
  onConfirm: i,
  onCancel: l
}) => {
  const [c, h] = f(""), u = c === o;
  return /* @__PURE__ */ s(Ze, { open: e, onClose: l, maxWidth: "sm", fullWidth: !0, children: [
    /* @__PURE__ */ t(et, { children: r }),
    /* @__PURE__ */ s(tt, { children: [
      /* @__PURE__ */ t(v, { variant: "body2", sx: { mb: 2 }, children: n }),
      /* @__PURE__ */ s(v, { variant: "body2", sx: { mb: 1, fontWeight: "bold" }, children: [
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
    /* @__PURE__ */ s(rt, { children: [
      /* @__PURE__ */ t(re, { onClick: l, children: "Cancel" }),
      /* @__PURE__ */ t(
        re,
        {
          onClick: () => {
            u && (i(), h(""));
          },
          disabled: !u,
          variant: "contained",
          color: "error",
          children: a
        }
      )
    ] })
  ] });
}, qs = ({
  open: e,
  onSubmit: r,
  onCancel: n
}) => {
  const [a, o] = f("postgres"), [i, l] = f("");
  return /* @__PURE__ */ s(Ze, { open: e, onClose: n, maxWidth: "sm", fullWidth: !0, children: [
    /* @__PURE__ */ t(et, { children: "Admin Credentials Required" }),
    /* @__PURE__ */ s(tt, { children: [
      /* @__PURE__ */ t(v, { variant: "body2", sx: { mb: 2 }, children: "Provide PostgreSQL admin credentials to perform this operation:" }),
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
          value: i,
          onChange: (c) => l(c.target.value),
          placeholder: "Enter admin password"
        }
      )
    ] }),
    /* @__PURE__ */ s(rt, { children: [
      /* @__PURE__ */ t(re, { onClick: n, children: "Cancel" }),
      /* @__PURE__ */ t(
        re,
        {
          onClick: () => {
            a && i && (r({ adminUser: a, adminPassword: i }), o("postgres"), l(""));
          },
          disabled: !a || !i,
          variant: "contained",
          children: "Continue"
        }
      )
    ] })
  ] });
}, Js = () => {
  const e = "/qapi/postgres:default", r = "default", [n, a] = f(null), [o, i] = f(!0), [l, c] = f(null), [h, u] = f(!1), [p, g] = f(!1), [y, w] = f("initialize"), [x, T] = f(!1), [$, N] = f(null), O = async () => {
    try {
      const L = await fetch(`${e}/status?instance=${r}`);
      if (!L.ok) throw new Error("Failed to fetch database status");
      const d = await L.json();
      a(d), c(null);
    } catch (L) {
      c(L instanceof Error ? L.message : "Unknown error");
    } finally {
      i(!1);
    }
  };
  ie(() => {
    O();
    const L = setInterval(O, 3e4);
    return () => clearInterval(L);
  }, [e, r]);
  const I = async (L) => {
    u(!0);
    try {
      const d = await fetch(`${e}/initialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instance: r,
          ...L
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
      u(!1), g(!1), T(!1), N(null);
    }
  }, b = async (L) => {
    u(!0);
    try {
      const d = await fetch(`${e}/recreate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instance: r,
          ...L
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
      u(!1), g(!1), T(!1), N(null);
    }
  }, k = (L) => {
    w(L), n != null && n.adminCredentialsProvided ? L === "recreate" ? g(!0) : I() : T(!0);
  }, D = (L) => {
    N(L), T(!1), y === "recreate" ? g(!0) : I(L);
  }, U = () => {
    y === "recreate" ? b($ || void 0) : I($ || void 0);
  };
  if (o)
    return /* @__PURE__ */ t(F, { children: /* @__PURE__ */ t(j, { children: /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
      /* @__PURE__ */ t(se, { size: 20 }),
      /* @__PURE__ */ t(v, { variant: "body2", children: "Loading database status..." })
    ] }) }) });
  if (l || !n)
    return /* @__PURE__ */ t(F, { children: /* @__PURE__ */ s(j, { children: [
      /* @__PURE__ */ s(v, { variant: "h6", gutterBottom: !0, children: [
        "Database (",
        r,
        ")"
      ] }),
      /* @__PURE__ */ t(q, { severity: "error", children: l || "Failed to load database status" })
    ] }) });
  const M = n.database ? `RECREATE ${n.database.toUpperCase()} DATABASE` : "RECREATE DATABASE", B = n.connected ? "success" : "error", de = n.connected ? "CONNECTED" : "ERROR";
  return /* @__PURE__ */ s(Be, { children: [
    /* @__PURE__ */ t(F, { children: /* @__PURE__ */ s(j, { children: [
      /* @__PURE__ */ s(m, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }, children: [
        /* @__PURE__ */ s(v, { variant: "h6", children: [
          "Database (",
          r,
          ")"
        ] }),
        /* @__PURE__ */ t(oe, { label: de, color: B, size: "small" })
      ] }),
      /* @__PURE__ */ t(v, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: h ? "Processing database operation..." : n.connected ? `Connected to ${n.database}` : n.errorMessage || "Database connection error" }),
      /* @__PURE__ */ s(m, { sx: { mb: 2 }, children: [
        /* @__PURE__ */ t(v, { variant: "caption", color: "text.secondary", children: "Connection" }),
        /* @__PURE__ */ t(v, { variant: "body2", fontWeight: "bold", children: de })
      ] }),
      /* @__PURE__ */ s(m, { sx: { mb: 2 }, children: [
        /* @__PURE__ */ t(v, { variant: "caption", color: "text.secondary", children: "Database" }),
        /* @__PURE__ */ t(v, { variant: "body2", fontWeight: "bold", children: n.database || "N/A" })
      ] }),
      /* @__PURE__ */ s(m, { sx: { mb: 2 }, children: [
        /* @__PURE__ */ t(v, { variant: "caption", color: "text.secondary", children: "Host" }),
        /* @__PURE__ */ s(v, { variant: "body2", fontWeight: "bold", children: [
          n.host || "N/A",
          ":",
          n.port || "N/A"
        ] })
      ] }),
      n.managed && /* @__PURE__ */ t(q, { severity: "info", sx: { mt: 2 }, children: "Managed database (Neon / Supabase). Delete and recreate is disabled — manage your database through the provider dashboard." }),
      !n.connected && !h && /* @__PURE__ */ s(m, { sx: { display: "flex", gap: 1, mt: 2 }, children: [
        /* @__PURE__ */ t(
          re,
          {
            variant: "contained",
            color: "primary",
            onClick: () => k("initialize"),
            size: "small",
            children: "Initialize Database"
          }
        ),
        !n.managed && /* @__PURE__ */ t(
          re,
          {
            variant: "contained",
            color: "error",
            onClick: () => k("recreate"),
            size: "small",
            children: "Recreate Database"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ t(
      qs,
      {
        open: x,
        onSubmit: D,
        onCancel: () => {
          T(!1), N(null);
        }
      }
    ),
    /* @__PURE__ */ t(
      Gs,
      {
        open: p,
        title: "Confirm Database Recreation",
        message: `This will drop and recreate the database "${n.database}". All data will be lost. This action cannot be undone.`,
        confirmText: "Recreate",
        requiredInput: M,
        onConfirm: U,
        onCancel: () => {
          g(!1), N(null);
        }
      }
    )
  ] });
}, Qt = te(/* @__PURE__ */ t("path", {
  d: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"
}), "Delete");
function Qs() {
  const [e, r] = f([]), [n, a] = f(""), [o, i] = f(null), [l, c] = f(!0), [h, u] = f(!1), [p, g] = f(null), [y, w] = f(null), [x, T] = f(!1), $ = async () => {
    try {
      const I = window.__API_BASE_PATH__ || "", b = await fetch(`${I}/logs/sources`);
      if (!b.ok) throw new Error("Failed to fetch log sources");
      const k = await b.json();
      r(k.sources || []), k.sources && k.sources.length > 0 && !n && a(k.sources[0].name);
    } catch (I) {
      g(I instanceof Error ? I.message : "Failed to fetch log sources");
    }
  }, N = async () => {
    if (n) {
      c(!0), g(null);
      try {
        const I = window.__API_BASE_PATH__ || "", b = await fetch(`${I}/logs/stats?source=${n}`);
        if (!b.ok) throw new Error("Failed to fetch log stats");
        const k = await b.json();
        i(k);
      } catch (I) {
        g(I instanceof Error ? I.message : "Failed to fetch log stats"), i(null);
      } finally {
        c(!1);
      }
    }
  };
  ie(() => {
    $();
  }, []), ie(() => {
    n && N();
  }, [n]);
  const O = async () => {
    T(!1), u(!0), g(null), w(null);
    try {
      const I = window.__API_BASE_PATH__ || "", b = await fetch(`${I}/logs/clear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: n })
      });
      if (!b.ok) {
        const D = await b.json();
        throw new Error(D.error || "Failed to clear logs");
      }
      const k = await b.json();
      w(k.message || "Logs cleared successfully"), await N();
    } catch (I) {
      g(I instanceof Error ? I.message : "Failed to clear logs");
    } finally {
      u(!1);
    }
  };
  return /* @__PURE__ */ t(F, { children: /* @__PURE__ */ s(j, { children: [
    /* @__PURE__ */ t(v, { variant: "h6", gutterBottom: !0, children: "Log Management" }),
    /* @__PURE__ */ t(v, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "View log statistics and clear log files" }),
    p && /* @__PURE__ */ t(q, { severity: "error", sx: { mb: 2 }, onClose: () => g(null), children: p }),
    y && /* @__PURE__ */ t(q, { severity: "success", sx: { mb: 2 }, onClose: () => w(null), children: y }),
    /* @__PURE__ */ t(m, { sx: { mb: 2 }, children: /* @__PURE__ */ s(rr, { fullWidth: !0, size: "small", children: [
      /* @__PURE__ */ t(nr, { children: "Log Source" }),
      /* @__PURE__ */ t(
        ar,
        {
          value: n,
          label: "Log Source",
          onChange: (I) => a(I.target.value),
          disabled: e.length === 0,
          children: e.map((I) => /* @__PURE__ */ s(Ae, { value: I.name, children: [
            I.name,
            " (",
            I.type,
            ")"
          ] }, I.name))
        }
      )
    ] }) }),
    l ? /* @__PURE__ */ t(m, { sx: { display: "flex", justifyContent: "center", p: 3 }, children: /* @__PURE__ */ t(se, { size: 30 }) }) : o ? /* @__PURE__ */ s(m, { sx: { mb: 2 }, children: [
      /* @__PURE__ */ s(v, { variant: "body2", color: "text.secondary", children: [
        /* @__PURE__ */ t("strong", { children: "Total Logs:" }),
        " ",
        o.totalLogs.toLocaleString()
      ] }),
      /* @__PURE__ */ s(v, { variant: "body2", color: "text.secondary", children: [
        /* @__PURE__ */ t("strong", { children: "File Size:" }),
        " ",
        o.fileSizeFormatted
      ] }),
      /* @__PURE__ */ t(v, { variant: "body2", color: "text.secondary", sx: { mt: 1 }, children: /* @__PURE__ */ t("strong", { children: "By Level:" }) }),
      /* @__PURE__ */ s(m, { sx: { pl: 2 }, children: [
        /* @__PURE__ */ s(v, { variant: "body2", color: "text.secondary", children: [
          "Debug: ",
          o.byLevel.debug.toLocaleString()
        ] }),
        /* @__PURE__ */ s(v, { variant: "body2", color: "text.secondary", children: [
          "Info: ",
          o.byLevel.info.toLocaleString()
        ] }),
        /* @__PURE__ */ s(v, { variant: "body2", color: "text.secondary", children: [
          "Warn: ",
          o.byLevel.warn.toLocaleString()
        ] }),
        /* @__PURE__ */ s(v, { variant: "body2", color: "error", children: [
          "Error: ",
          o.byLevel.error.toLocaleString()
        ] })
      ] })
    ] }) : null,
    /* @__PURE__ */ s(m, { sx: { display: "flex", gap: 1 }, children: [
      /* @__PURE__ */ t(
        re,
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
        re,
        {
          variant: "contained",
          color: "error",
          size: "small",
          startIcon: h ? /* @__PURE__ */ t(se, { size: 16, color: "inherit" }) : /* @__PURE__ */ t(Qt, {}),
          onClick: () => T(!0),
          disabled: !n || h || l,
          children: "Clear Logs"
        }
      )
    ] }),
    /* @__PURE__ */ s(Ze, { open: x, onClose: () => T(!1), children: [
      /* @__PURE__ */ t(et, { children: "Clear Log File" }),
      /* @__PURE__ */ t(tt, { children: /* @__PURE__ */ s(Ln, { children: [
        'Are you sure you want to clear the "',
        n,
        '" log file? This action cannot be undone.'
      ] }) }),
      /* @__PURE__ */ s(rt, { children: [
        /* @__PURE__ */ t(re, { onClick: () => T(!1), children: "Cancel" }),
        /* @__PURE__ */ t(re, { onClick: O, color: "error", variant: "contained", children: "Clear" })
      ] })
    ] })
  ] }) });
}
function Ys() {
  const [e, r] = f(null), [n, a] = f(!0), [o, i] = f(!1), [l, c] = f(null), [h, u] = f(null), [p, g] = f(!1), y = async () => {
    a(!0), c(null);
    try {
      const x = window.__API_BASE_PATH__ || "", T = await fetch(`${x}/cache:default/stats`);
      if (!T.ok)
        throw T.status === 404 ? new Error("Cache plugin not configured") : new Error("Failed to fetch cache stats");
      const $ = await T.json();
      r($);
    } catch (x) {
      c(x instanceof Error ? x.message : "Failed to fetch cache stats"), r(null);
    } finally {
      a(!1);
    }
  };
  ie(() => {
    y();
  }, []);
  const w = async () => {
    g(!1), i(!0), c(null), u(null);
    try {
      const x = window.__API_BASE_PATH__ || "", T = await fetch(`${x}/cache:default/flush`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!T.ok) {
        const N = await T.json();
        throw new Error(N.error || "Failed to flush cache");
      }
      const $ = await T.json();
      u(
        $.message + ($.deletedCount !== void 0 ? ` (${$.deletedCount} keys deleted)` : "")
      ), await y();
    } catch (x) {
      c(x instanceof Error ? x.message : "Failed to flush cache");
    } finally {
      i(!1);
    }
  };
  return /* @__PURE__ */ t(F, { children: /* @__PURE__ */ s(j, { children: [
    /* @__PURE__ */ t(v, { variant: "h6", gutterBottom: !0, children: "Cache Management" }),
    /* @__PURE__ */ t(v, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "View cache statistics and clear cache" }),
    l && /* @__PURE__ */ t(q, { severity: "error", sx: { mb: 2 }, onClose: () => c(null), children: l }),
    h && /* @__PURE__ */ t(q, { severity: "success", sx: { mb: 2 }, onClose: () => u(null), children: h }),
    n ? /* @__PURE__ */ t(m, { sx: { display: "flex", justifyContent: "center", p: 3 }, children: /* @__PURE__ */ t(se, { size: 30 }) }) : e ? /* @__PURE__ */ s(m, { sx: { mb: 2 }, children: [
      /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 1 }, children: [
        /* @__PURE__ */ t(v, { variant: "body2", color: "text.secondary", children: /* @__PURE__ */ t("strong", { children: "Status:" }) }),
        /* @__PURE__ */ t(
          oe,
          {
            size: "small",
            icon: e.connected ? /* @__PURE__ */ t(ze, {}) : /* @__PURE__ */ t(Ee, {}),
            label: e.connected ? "Connected" : "Disconnected",
            color: e.connected ? "success" : "error"
          }
        )
      ] }),
      /* @__PURE__ */ s(v, { variant: "body2", color: "text.secondary", children: [
        /* @__PURE__ */ t("strong", { children: "Key Count:" }),
        " ",
        e.keyCount.toLocaleString()
      ] }),
      e.usedMemory && /* @__PURE__ */ s(v, { variant: "body2", color: "text.secondary", children: [
        /* @__PURE__ */ t("strong", { children: "Memory Used:" }),
        " ",
        e.usedMemory
      ] })
    ] }) : null,
    /* @__PURE__ */ s(m, { sx: { display: "flex", gap: 1 }, children: [
      /* @__PURE__ */ t(
        re,
        {
          variant: "outlined",
          color: "primary",
          size: "small",
          startIcon: /* @__PURE__ */ t(mt, {}),
          onClick: y,
          disabled: n,
          children: "Refresh"
        }
      ),
      /* @__PURE__ */ t(
        re,
        {
          variant: "contained",
          color: "error",
          size: "small",
          startIcon: o ? /* @__PURE__ */ t(se, { size: 16, color: "inherit" }) : /* @__PURE__ */ t(Qt, {}),
          onClick: () => g(!0),
          disabled: !e || !e.connected || o || n,
          children: "Flush Cache"
        }
      )
    ] }),
    /* @__PURE__ */ s(Ze, { open: p, onClose: () => g(!1), children: [
      /* @__PURE__ */ t(et, { children: "Flush Cache" }),
      /* @__PURE__ */ t(tt, { children: /* @__PURE__ */ s(Ln, { children: [
        "Are you sure you want to flush the cache? This will delete",
        " ",
        e == null ? void 0 : e.keyCount.toLocaleString(),
        " keys. This action cannot be undone."
      ] }) }),
      /* @__PURE__ */ s(rt, { children: [
        /* @__PURE__ */ t(re, { onClick: () => g(!1), children: "Cancel" }),
        /* @__PURE__ */ t(re, { onClick: w, color: "error", variant: "contained", children: "Flush" })
      ] })
    ] })
  ] }) });
}
const Ar = 1e5, Br = 10;
function Mr(e, r = 0) {
  return r > Br ? !0 : e && typeof e == "object" && !Array.isArray(e) ? Object.values(e).some((n) => Mr(n, r + 1)) : Array.isArray(e) ? e.some((n) => Mr(n, r + 1)) : !1;
}
function Xs() {
  const [e, r] = f("{}"), [n, a] = f(!0), [o, i] = f(!1), [l, c] = f(null), [h, u] = f(!1), [p, g] = f(null), [y, w] = f(!1);
  ie(() => {
    (async () => {
      try {
        const k = await Y.getPreferences();
        r(JSON.stringify(k.preferences, null, 2)), c(null);
      } catch (k) {
        c(k instanceof Error ? k.message : "Failed to load preferences");
      } finally {
        a(!1);
      }
    })();
  }, []);
  const x = (b) => {
    r(b), w(!0), u(!1);
    try {
      const k = JSON.parse(b);
      if (Mr(k)) {
        g(`Preferences object too deeply nested (max ${Br} levels)`);
        return;
      }
      g(null);
    } catch (k) {
      g(k instanceof Error ? k.message : "Invalid JSON");
    }
  }, T = async () => {
    if (!p)
      try {
        const b = JSON.parse(e);
        i(!0), c(null);
        const k = await Y.updatePreferences(b);
        r(JSON.stringify(k.preferences, null, 2)), u(!0), w(!1);
      } catch (b) {
        c(b instanceof Error ? b.message : "Failed to save preferences");
      } finally {
        i(!1);
      }
  }, $ = async () => {
    if (confirm("Reset all preferences to defaults? This cannot be undone."))
      try {
        i(!0), c(null), await Y.deletePreferences();
        const b = await Y.getPreferences();
        r(JSON.stringify(b.preferences, null, 2)), u(!0), w(!1);
      } catch (b) {
        c(b instanceof Error ? b.message : "Failed to reset preferences");
      } finally {
        i(!1);
      }
  }, N = () => {
    try {
      const b = JSON.parse(e);
      r(JSON.stringify(b, null, 2)), g(null);
    } catch {
    }
  };
  if (n)
    return /* @__PURE__ */ t(m, { sx: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }, children: /* @__PURE__ */ t(se, {}) });
  const O = e.length, I = O / Ar * 100;
  return /* @__PURE__ */ s(m, { children: [
    /* @__PURE__ */ s(m, { sx: { mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
      /* @__PURE__ */ s(m, { children: [
        /* @__PURE__ */ t(v, { variant: "h4", sx: { color: "var(--theme-text-primary)" }, children: "Preferences" }),
        /* @__PURE__ */ t(v, { variant: "body2", sx: { color: "var(--theme-text-secondary)", mt: 0.5 }, children: "Manage your user preferences as JSON" })
      ] }),
      /* @__PURE__ */ t(m, { sx: { display: "flex", gap: 1 }, children: /* @__PURE__ */ t(
        oe,
        {
          label: `${O.toLocaleString()} / ${Ar.toLocaleString()} bytes`,
          size: "small",
          color: I > 90 ? "error" : I > 75 ? "warning" : "default"
        }
      ) })
    ] }),
    l && /* @__PURE__ */ t(q, { severity: "error", sx: { mb: 2 }, onClose: () => c(null), children: l }),
    h && /* @__PURE__ */ t(q, { severity: "success", sx: { mb: 2 }, onClose: () => u(!1), children: "Preferences saved successfully" }),
    /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", mb: 2 }, children: /* @__PURE__ */ s(j, { children: [
      /* @__PURE__ */ s(m, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }, children: [
        /* @__PURE__ */ t(v, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: "Preferences JSON" }),
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
          onChange: (b) => x(b.target.value),
          error: !!p,
          helperText: p || `Edit your preferences as JSON. Max ${Ar.toLocaleString()} bytes, max ${Br} levels deep.`,
          sx: {
            "& .MuiInputBase-root": {
              fontFamily: "monospace",
              fontSize: "0.875rem"
            }
          }
        }
      )
    ] }) }),
    /* @__PURE__ */ s(m, { sx: { display: "flex", gap: 2, justifyContent: "flex-end" }, children: [
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
          onClick: T,
          disabled: !!p || !y || o,
          loading: o,
          children: "Save Preferences"
        }
      )
    ] })
  ] });
}
function Zs() {
  return [
    { name: "ServiceHealthWidget", component: $s },
    { name: "IntegrationStatusWidget", component: As },
    { name: "AuthStatusWidget", component: Ps },
    { name: "NotificationsStatsWidget", component: Os },
    { name: "CMSStatusWidget", component: Ms },
    { name: "CMSMaintenanceWidget", component: Rs },
    { name: "SeedManagementWidget", component: js },
    { name: "MigrationManagementWidget", component: Us },
    { name: "ServiceControlWidget", component: Vs },
    { name: "EnvironmentConfigWidget", component: Hs },
    { name: "DatabaseOpsWidget", component: Ks },
    { name: "DatabaseOperationsWidget", component: Js },
    { name: "LogsMaintenanceWidget", component: Qs },
    { name: "CacheMaintenanceWidget", component: Ys },
    { name: "PreferencesPage", component: Xs }
  ];
}
function el(e) {
  switch (e) {
    case "healthy":
      return /* @__PURE__ */ t(ze, { sx: { color: "var(--theme-success)" } });
    case "degraded":
      return /* @__PURE__ */ t(Kt, { sx: { color: "var(--theme-warning)" } });
    case "unhealthy":
      return /* @__PURE__ */ t(Ee, { sx: { color: "var(--theme-error)" } });
    default:
      return /* @__PURE__ */ t(se, { size: 20 });
  }
}
function Tr(e) {
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
function tl() {
  var y, w;
  const e = zn(), [r, n] = f(null), [a, o] = f(null), [i, l] = f(!0), [c, h] = f(null);
  if (ie(() => {
    const x = async () => {
      try {
        const [$, N] = await Promise.all([
          Y.getHealth(),
          Y.getInfo()
        ]);
        n($), o(N), h(null);
      } catch ($) {
        h($ instanceof Error ? $.message : "Failed to fetch data");
      } finally {
        l(!1);
      }
    };
    x();
    const T = setInterval(x, 1e4);
    return () => clearInterval(T);
  }, []), i)
    return /* @__PURE__ */ t(m, { sx: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }, children: /* @__PURE__ */ t(se, {}) });
  if (c)
    return /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", border: "1px solid var(--theme-error)" }, children: /* @__PURE__ */ t(j, { children: /* @__PURE__ */ t(v, { color: "error", children: c }) }) });
  const u = r ? Object.entries(r.checks) : [], p = u.filter(([, x]) => x.status === "healthy").length, g = u.length;
  return /* @__PURE__ */ s(m, { children: [
    /* @__PURE__ */ t(v, { variant: "h4", sx: { mb: 1, color: "var(--theme-text-primary)" }, children: "Dashboard" }),
    /* @__PURE__ */ s(v, { variant: "body2", sx: { mb: 4, color: "var(--theme-text-secondary)" }, children: [
      "Real-time overview of ",
      (a == null ? void 0 : a.product) || "your service"
    ] }),
    /* @__PURE__ */ t(
      F,
      {
        sx: {
          mb: 4,
          bgcolor: "var(--theme-surface)",
          border: `2px solid ${Tr((r == null ? void 0 : r.status) || "unknown")}`
        },
        children: /* @__PURE__ */ t(Da, { onClick: () => e("/health"), children: /* @__PURE__ */ s(j, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
          /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
            el((r == null ? void 0 : r.status) || "unknown"),
            /* @__PURE__ */ s(m, { children: [
              /* @__PURE__ */ s(v, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: [
                "Service Status: ",
                (y = r == null ? void 0 : r.status) == null ? void 0 : y.charAt(0).toUpperCase(),
                (w = r == null ? void 0 : r.status) == null ? void 0 : w.slice(1)
              ] }),
              /* @__PURE__ */ t(v, { variant: "body2", sx: { color: "var(--theme-text-secondary)" }, children: "Click to view detailed health information" })
            ] })
          ] }),
          /* @__PURE__ */ t(
            oe,
            {
              label: `${p}/${g} checks passing`,
              sx: {
                bgcolor: Tr((r == null ? void 0 : r.status) || "unknown") + "20",
                color: Tr((r == null ? void 0 : r.status) || "unknown")
              }
            }
          )
        ] }) })
      }
    ),
    /* @__PURE__ */ t(ks, { widgetType: "status" }),
    /* @__PURE__ */ t(Cs, {})
  ] });
}
const Hr = te(/* @__PURE__ */ t("path", {
  d: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14"
}), "Search"), rl = te(/* @__PURE__ */ t("path", {
  d: "M6 19h4V5H6zm8-14v14h4V5z"
}), "Pause"), nl = te(/* @__PURE__ */ t("path", {
  d: "m4 12 1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8z"
}), "ArrowUpward"), al = te(/* @__PURE__ */ t("path", {
  d: "m20 12-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8z"
}), "ArrowDownward"), ol = te(/* @__PURE__ */ t("path", {
  d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m1 15h-2v-6h2zm0-8h-2V7h2z"
}), "Info"), il = te(/* @__PURE__ */ t("path", {
  d: "M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5s-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20zm-6 8h-4v-2h4zm0-4h-4v-2h4z"
}), "BugReport");
function kn(e) {
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
function sl() {
  const [e, r] = f([]), [n, a] = f([]), [o, i] = f(!0), [l, c] = f(null), [h, u] = f(""), [p, g] = f(""), [y, w] = f(""), [x, T] = f(1), [$, N] = f(0), O = 50, [I, b] = f(!1), [k, D] = f("desc"), U = ka(null), M = {
    total: $,
    errors: e.filter((C) => C.level.toLowerCase() === "error").length,
    warnings: e.filter((C) => ["warn", "warning"].includes(C.level.toLowerCase())).length,
    info: e.filter((C) => C.level.toLowerCase() === "info").length,
    debug: e.filter((C) => C.level.toLowerCase() === "debug").length
  }, B = Se(async () => {
    i(!0);
    try {
      const C = await Y.getLogs({
        source: h || void 0,
        level: p || void 0,
        search: y || void 0,
        limit: O,
        page: x
      }), R = [...C.logs].sort((V, he) => {
        const G = new Date(V.timestamp).getTime(), ve = new Date(he.timestamp).getTime();
        return k === "desc" ? ve - G : G - ve;
      });
      r(R), N(C.total), c(null);
    } catch (C) {
      c(C instanceof Error ? C.message : "Failed to fetch logs");
    } finally {
      i(!1);
    }
  }, [h, p, y, x, k]), de = async () => {
    try {
      const C = await Y.getLogSources();
      a(C);
    } catch {
    }
  };
  ie(() => {
    de();
  }, []), ie(() => {
    B();
  }, [B]), ie(() => (I ? U.current = setInterval(B, 5e3) : U.current && (clearInterval(U.current), U.current = null), () => {
    U.current && clearInterval(U.current);
  }), [I, B]);
  const L = () => {
    T(1), B();
  }, d = (C, R) => {
    R !== null && D(R);
  }, z = Math.ceil($ / O);
  return /* @__PURE__ */ s(m, { children: [
    /* @__PURE__ */ t(v, { variant: "h4", sx: { mb: 1, color: "var(--theme-text-primary)" }, children: "Logs" }),
    /* @__PURE__ */ t(v, { variant: "body2", sx: { mb: 4, color: "var(--theme-text-secondary)" }, children: "View and search application logs" }),
    /* @__PURE__ */ s(Te, { container: !0, spacing: 2, sx: { mb: 3 }, children: [
      /* @__PURE__ */ t(Te, { size: { xs: 6, sm: 3, md: 2.4 }, children: /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ s(j, { sx: { py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }, children: [
        /* @__PURE__ */ t(m, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: /* @__PURE__ */ t(v, { variant: "h5", sx: { color: "var(--theme-text-primary)", fontWeight: 600 }, children: M.total.toLocaleString() }) }),
        /* @__PURE__ */ t(v, { variant: "caption", sx: { color: "var(--theme-text-secondary)" }, children: "Total Logs" })
      ] }) }) }),
      /* @__PURE__ */ t(Te, { size: { xs: 6, sm: 3, md: 2.4 }, children: /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ s(j, { sx: { py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }, children: [
        /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
          /* @__PURE__ */ t(Ee, { sx: { color: "var(--theme-error)", fontSize: 20 } }),
          /* @__PURE__ */ t(v, { variant: "h5", sx: { color: "var(--theme-error)", fontWeight: 600 }, children: M.errors })
        ] }),
        /* @__PURE__ */ t(v, { variant: "caption", sx: { color: "var(--theme-text-secondary)" }, children: "Errors" })
      ] }) }) }),
      /* @__PURE__ */ t(Te, { size: { xs: 6, sm: 3, md: 2.4 }, children: /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ s(j, { sx: { py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }, children: [
        /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
          /* @__PURE__ */ t(Kt, { sx: { color: "var(--theme-warning)", fontSize: 20 } }),
          /* @__PURE__ */ t(v, { variant: "h5", sx: { color: "var(--theme-warning)", fontWeight: 600 }, children: M.warnings })
        ] }),
        /* @__PURE__ */ t(v, { variant: "caption", sx: { color: "var(--theme-text-secondary)" }, children: "Warnings" })
      ] }) }) }),
      /* @__PURE__ */ t(Te, { size: { xs: 6, sm: 3, md: 2.4 }, children: /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ s(j, { sx: { py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }, children: [
        /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
          /* @__PURE__ */ t(ol, { sx: { color: "var(--theme-info)", fontSize: 20 } }),
          /* @__PURE__ */ t(v, { variant: "h5", sx: { color: "var(--theme-info)", fontWeight: 600 }, children: M.info })
        ] }),
        /* @__PURE__ */ t(v, { variant: "caption", sx: { color: "var(--theme-text-secondary)" }, children: "Info" })
      ] }) }) }),
      /* @__PURE__ */ t(Te, { size: { xs: 6, sm: 3, md: 2.4 }, children: /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ s(j, { sx: { py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }, children: [
        /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
          /* @__PURE__ */ t(il, { sx: { color: "var(--theme-text-secondary)", fontSize: 20 } }),
          /* @__PURE__ */ t(v, { variant: "h5", sx: { color: "var(--theme-text-primary)", fontWeight: 600 }, children: M.debug })
        ] }),
        /* @__PURE__ */ t(v, { variant: "caption", sx: { color: "var(--theme-text-secondary)" }, children: "Debug" })
      ] }) }) })
    ] }),
    /* @__PURE__ */ t(F, { sx: { mb: 3, bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(j, { children: /* @__PURE__ */ s(m, { sx: { display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }, children: [
      n.length > 0 && /* @__PURE__ */ s(rr, { size: "small", sx: { minWidth: 150 }, children: [
        /* @__PURE__ */ t(nr, { sx: { color: "var(--theme-text-secondary)" }, children: "Source" }),
        /* @__PURE__ */ s(
          ar,
          {
            value: h,
            label: "Source",
            onChange: (C) => u(C.target.value),
            sx: { color: "var(--theme-text-primary)" },
            children: [
              /* @__PURE__ */ t(Ae, { value: "", children: "All Sources" }),
              n.map((C) => /* @__PURE__ */ t(Ae, { value: C.name, children: C.name }, C.name))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ s(rr, { size: "small", sx: { minWidth: 120 }, children: [
        /* @__PURE__ */ t(nr, { sx: { color: "var(--theme-text-secondary)" }, children: "Level" }),
        /* @__PURE__ */ s(
          ar,
          {
            value: p,
            label: "Level",
            onChange: (C) => g(C.target.value),
            sx: { color: "var(--theme-text-primary)" },
            children: [
              /* @__PURE__ */ t(Ae, { value: "", children: "All Levels" }),
              /* @__PURE__ */ t(Ae, { value: "error", children: "Error" }),
              /* @__PURE__ */ t(Ae, { value: "warn", children: "Warning" }),
              /* @__PURE__ */ t(Ae, { value: "info", children: "Info" }),
              /* @__PURE__ */ t(Ae, { value: "debug", children: "Debug" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ t(
        K,
        {
          size: "small",
          placeholder: "Search logs...",
          value: y,
          onChange: (C) => w(C.target.value),
          onKeyPress: (C) => C.key === "Enter" && L(),
          sx: {
            flex: 1,
            minWidth: 200,
            "& .MuiInputBase-input": { color: "var(--theme-text-primary)" }
          },
          InputProps: {
            startAdornment: /* @__PURE__ */ t(Hr, { sx: { mr: 1, color: "var(--theme-text-secondary)" } })
          }
        }
      ),
      /* @__PURE__ */ s(
        Na,
        {
          value: k,
          exclusive: !0,
          onChange: d,
          size: "small",
          "aria-label": "sort order",
          children: [
            /* @__PURE__ */ t(en, { value: "desc", "aria-label": "newest first", children: /* @__PURE__ */ t(De, { title: "Newest First", children: /* @__PURE__ */ t(al, { fontSize: "small" }) }) }),
            /* @__PURE__ */ t(en, { value: "asc", "aria-label": "oldest first", children: /* @__PURE__ */ t(De, { title: "Oldest First", children: /* @__PURE__ */ t(nl, { fontSize: "small" }) }) })
          ]
        }
      ),
      /* @__PURE__ */ t(De, { title: I ? "Pause auto-refresh" : "Enable auto-refresh (5s)", children: /* @__PURE__ */ t(
        Me,
        {
          onClick: () => b(!I),
          sx: {
            color: I ? "var(--theme-success)" : "var(--theme-text-secondary)",
            bgcolor: I ? "var(--theme-success)20" : "transparent"
          },
          children: I ? /* @__PURE__ */ t(rl, {}) : /* @__PURE__ */ t(ft, {})
        }
      ) }),
      /* @__PURE__ */ t(De, { title: "Refresh", children: /* @__PURE__ */ t(Me, { onClick: B, sx: { color: "var(--theme-primary)" }, children: /* @__PURE__ */ t(mt, {}) }) })
    ] }) }) }),
    l && /* @__PURE__ */ t(F, { sx: { mb: 3, bgcolor: "var(--theme-surface)", border: "1px solid var(--theme-error)" }, children: /* @__PURE__ */ t(j, { children: /* @__PURE__ */ t(v, { color: "error", children: l }) }) }),
    /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: o ? /* @__PURE__ */ t(m, { sx: { display: "flex", justifyContent: "center", p: 4 }, children: /* @__PURE__ */ t(se, {}) }) : e.length === 0 ? /* @__PURE__ */ t(j, { children: /* @__PURE__ */ t(v, { sx: { color: "var(--theme-text-secondary)", textAlign: "center" }, children: "No logs found" }) }) : /* @__PURE__ */ s(Be, { children: [
      /* @__PURE__ */ t(qe, { children: /* @__PURE__ */ s(Je, { size: "small", children: [
        /* @__PURE__ */ t(Qe, { children: /* @__PURE__ */ s(be, { children: [
          /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", width: 180 }, children: "Timestamp" }),
          /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", width: 100 }, children: "Level" }),
          /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", width: 120 }, children: "Component" }),
          /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Message" })
        ] }) }),
        /* @__PURE__ */ t(Ye, { children: e.map((C, R) => /* @__PURE__ */ s(be, { hover: !0, children: [
          /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", fontFamily: "monospace", fontSize: "0.75rem" }, children: new Date(C.timestamp).toLocaleString() }),
          /* @__PURE__ */ t(_, { sx: { borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(
            oe,
            {
              label: C.level.toUpperCase(),
              size: "small",
              sx: {
                bgcolor: kn(C.level) + "20",
                color: kn(C.level),
                fontSize: "0.65rem",
                height: 20
              }
            }
          ) }),
          /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", fontSize: "0.75rem" }, children: C.namespace || "-" }),
          /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)", fontFamily: "monospace", fontSize: "0.8rem", whiteSpace: "pre-wrap", wordBreak: "break-all" }, children: C.message })
        ] }, R)) })
      ] }) }),
      z > 1 && /* @__PURE__ */ t(m, { sx: { display: "flex", justifyContent: "center", p: 2 }, children: /* @__PURE__ */ t(
        za,
        {
          count: z,
          page: x,
          onChange: (C, R) => T(R),
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
const Kr = te(/* @__PURE__ */ t("path", {
  d: "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m0 16H8V7h11z"
}), "ContentCopy"), ll = te(/* @__PURE__ */ t("path", {
  d: "M15 9H9v6h6zm-2 4h-2v-2h2zm8-2V9h-2V7c0-1.1-.9-2-2-2h-2V3h-2v2h-2V3H9v2H7c-1.1 0-2 .9-2 2v2H3v2h2v2H3v2h2v2c0 1.1.9 2 2 2h2v2h2v-2h2v2h2v-2h2c1.1 0 2-.9 2-2v-2h2v-2h-2v-2zm-4 6H7V7h10z"
}), "Memory"), cl = te(/* @__PURE__ */ t("path", {
  d: "M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2zM4 6h16v10H4z"
}), "Computer"), dl = te(/* @__PURE__ */ t("path", {
  d: "M2 20h20v-4H2zm2-3h2v2H4zM2 4v4h20V4zm4 3H4V5h2zm-4 7h20v-4H2zm2-3h2v2H4z"
}), "Storage"), hl = te([/* @__PURE__ */ t("path", {
  d: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8"
}, "0"), /* @__PURE__ */ t("path", {
  d: "M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"
}, "1")], "AccessTime"), ul = te(/* @__PURE__ */ t("path", {
  d: "m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z"
}), "Favorite");
function Pr(e) {
  if (e === 0) return "0 B";
  const r = 1024, n = ["B", "KB", "MB", "GB"], a = Math.floor(Math.log(e) / Math.log(r));
  return parseFloat((e / Math.pow(r, a)).toFixed(2)) + " " + n[a];
}
function ml(e) {
  const r = Math.floor(e / 1e3), n = Math.floor(r / 60), a = Math.floor(n / 60), o = Math.floor(a / 24);
  return o > 0 ? `${o}d ${a % 24}h ${n % 60}m` : a > 0 ? `${a}h ${n % 60}m ${r % 60}s` : n > 0 ? `${n}m ${r % 60}s` : `${r}s`;
}
function fl(e, r = 20) {
  switch (e) {
    case "healthy":
      return /* @__PURE__ */ t(ze, { sx: { color: "var(--theme-success)", fontSize: r } });
    case "degraded":
      return /* @__PURE__ */ t(Kt, { sx: { color: "var(--theme-warning)", fontSize: r } });
    case "unhealthy":
      return /* @__PURE__ */ t(Ee, { sx: { color: "var(--theme-error)", fontSize: r } });
    default:
      return /* @__PURE__ */ t(se, { size: r });
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
function pl(e) {
  return e === void 0 ? "-" : e < 1e3 ? `${e}ms` : `${(e / 1e3).toFixed(2)}s`;
}
function gl() {
  const [e, r] = f(null), [n, a] = f(null), [o, i] = f(!0), [l, c] = f(null), [h, u] = f({
    open: !1,
    message: ""
  }), p = async () => {
    i(!0);
    try {
      const [w, x] = await Promise.all([
        Y.getDiagnostics(),
        Y.getHealth().catch(() => null)
        // Health might not be available
      ]);
      r(w), a(x), c(null);
    } catch (w) {
      c(w instanceof Error ? w.message : "Failed to fetch diagnostics");
    } finally {
      i(!1);
    }
  };
  ie(() => {
    p();
    const w = setInterval(p, 3e4);
    return () => clearInterval(w);
  }, []);
  const g = () => {
    navigator.clipboard.writeText(JSON.stringify(e, null, 2)), u({ open: !0, message: "Diagnostics copied to clipboard" });
  };
  if (o && !e)
    return /* @__PURE__ */ t(m, { sx: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }, children: /* @__PURE__ */ t(se, {}) });
  if (l)
    return /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", border: "1px solid var(--theme-error)" }, children: /* @__PURE__ */ t(j, { children: /* @__PURE__ */ t(v, { color: "error", children: l }) }) });
  const y = e ? e.system.memory.used / e.system.memory.total * 100 : 0;
  return /* @__PURE__ */ s(m, { children: [
    /* @__PURE__ */ s(m, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }, children: [
      /* @__PURE__ */ t(v, { variant: "h4", sx: { color: "var(--theme-text-primary)" }, children: "System" }),
      /* @__PURE__ */ s(m, { sx: { display: "flex", gap: 1 }, children: [
        /* @__PURE__ */ t(De, { title: "Copy diagnostics JSON", children: /* @__PURE__ */ t(Me, { onClick: g, sx: { color: "var(--theme-primary)" }, children: /* @__PURE__ */ t(Kr, {}) }) }),
        /* @__PURE__ */ t(De, { title: "Refresh", children: /* @__PURE__ */ t(Me, { onClick: p, sx: { color: "var(--theme-primary)" }, children: /* @__PURE__ */ t(mt, {}) }) })
      ] })
    ] }),
    /* @__PURE__ */ t(v, { variant: "body2", sx: { mb: 4, color: "var(--theme-text-secondary)" }, children: "System information and diagnostics" }),
    /* @__PURE__ */ s(Te, { container: !0, spacing: 3, children: [
      /* @__PURE__ */ t(Te, { size: { xs: 12, md: 6 }, children: /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", height: "100%" }, children: /* @__PURE__ */ s(j, { children: [
        /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 3 }, children: [
          /* @__PURE__ */ t(cl, { sx: { color: "var(--theme-primary)" } }),
          /* @__PURE__ */ t(v, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: "System Information" })
        ] }),
        /* @__PURE__ */ s(m, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: [
          /* @__PURE__ */ s(m, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(v, { sx: { color: "var(--theme-text-secondary)" }, children: "QwickApps Server" }),
            /* @__PURE__ */ t(
              oe,
              {
                label: e != null && e.frameworkVersion ? `v${e.frameworkVersion}` : "N/A",
                size: "small",
                sx: { bgcolor: "var(--theme-primary)20", color: "var(--theme-primary)" }
              }
            )
          ] }),
          /* @__PURE__ */ s(m, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(v, { sx: { color: "var(--theme-text-secondary)" }, children: "Node.js" }),
            /* @__PURE__ */ t(
              oe,
              {
                label: e == null ? void 0 : e.system.nodeVersion,
                size: "small",
                sx: { bgcolor: "var(--theme-background)", color: "var(--theme-text-primary)" }
              }
            )
          ] }),
          /* @__PURE__ */ s(m, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(v, { sx: { color: "var(--theme-text-secondary)" }, children: "Platform" }),
            /* @__PURE__ */ t(
              oe,
              {
                label: e == null ? void 0 : e.system.platform,
                size: "small",
                sx: { bgcolor: "var(--theme-background)", color: "var(--theme-text-primary)" }
              }
            )
          ] }),
          /* @__PURE__ */ s(m, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(v, { sx: { color: "var(--theme-text-secondary)" }, children: "Architecture" }),
            /* @__PURE__ */ t(
              oe,
              {
                label: e == null ? void 0 : e.system.arch,
                size: "small",
                sx: { bgcolor: "var(--theme-background)", color: "var(--theme-text-primary)" }
              }
            )
          ] })
        ] })
      ] }) }) }),
      /* @__PURE__ */ t(Te, { size: { xs: 12, md: 6 }, children: /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", height: "100%" }, children: /* @__PURE__ */ s(j, { children: [
        /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 3 }, children: [
          /* @__PURE__ */ t(ll, { sx: { color: "var(--theme-warning)" } }),
          /* @__PURE__ */ t(v, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: "Memory Usage" })
        ] }),
        /* @__PURE__ */ s(m, { sx: { mb: 2 }, children: [
          /* @__PURE__ */ s(m, { sx: { display: "flex", justifyContent: "space-between", mb: 1 }, children: [
            /* @__PURE__ */ t(v, { sx: { color: "var(--theme-text-secondary)" }, children: "Heap Used" }),
            /* @__PURE__ */ t(v, { sx: { color: "var(--theme-text-primary)" }, children: Pr((e == null ? void 0 : e.system.memory.used) || 0) })
          ] }),
          /* @__PURE__ */ t(
            Gt,
            {
              variant: "determinate",
              value: y,
              sx: {
                height: 8,
                borderRadius: 4,
                bgcolor: "var(--theme-background)",
                "& .MuiLinearProgress-bar": {
                  bgcolor: y > 80 ? "var(--theme-error)" : "var(--theme-warning)",
                  borderRadius: 4
                }
              }
            }
          )
        ] }),
        /* @__PURE__ */ s(m, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: [
          /* @__PURE__ */ s(m, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(v, { sx: { color: "var(--theme-text-secondary)" }, children: "Heap Total" }),
            /* @__PURE__ */ t(v, { sx: { color: "var(--theme-text-primary)" }, children: Pr((e == null ? void 0 : e.system.memory.total) || 0) })
          ] }),
          /* @__PURE__ */ s(m, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(v, { sx: { color: "var(--theme-text-secondary)" }, children: "Heap Free" }),
            /* @__PURE__ */ t(v, { sx: { color: "var(--theme-text-primary)" }, children: Pr((e == null ? void 0 : e.system.memory.free) || 0) })
          ] })
        ] })
      ] }) }) }),
      /* @__PURE__ */ t(Te, { size: { xs: 12, md: 6 }, children: /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", height: "100%" }, children: /* @__PURE__ */ s(j, { children: [
        /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 3 }, children: [
          /* @__PURE__ */ t(dl, { sx: { color: "var(--theme-info)" } }),
          /* @__PURE__ */ t(v, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: "Service Info" })
        ] }),
        /* @__PURE__ */ s(m, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: [
          /* @__PURE__ */ s(m, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(v, { sx: { color: "var(--theme-text-secondary)" }, children: "Product" }),
            /* @__PURE__ */ t(v, { sx: { color: "var(--theme-text-primary)" }, children: e == null ? void 0 : e.product })
          ] }),
          /* @__PURE__ */ s(m, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(v, { sx: { color: "var(--theme-text-secondary)" }, children: "Version" }),
            /* @__PURE__ */ t(
              oe,
              {
                label: (e == null ? void 0 : e.version) || "N/A",
                size: "small",
                sx: { bgcolor: "var(--theme-primary)20", color: "var(--theme-primary)" }
              }
            )
          ] }),
          /* @__PURE__ */ s(m, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ t(v, { sx: { color: "var(--theme-text-secondary)" }, children: "Timestamp" }),
            /* @__PURE__ */ t(v, { sx: { color: "var(--theme-text-primary)", fontSize: "0.875rem" }, children: e != null && e.timestamp ? new Date(e.timestamp).toLocaleString() : "N/A" })
          ] })
        ] })
      ] }) }) }),
      /* @__PURE__ */ t(Te, { size: { xs: 12, md: 6 }, children: /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", height: "100%" }, children: /* @__PURE__ */ s(j, { children: [
        /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 3 }, children: [
          /* @__PURE__ */ t(hl, { sx: { color: "var(--theme-success)" } }),
          /* @__PURE__ */ t(v, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: "Uptime" })
        ] }),
        /* @__PURE__ */ t(v, { variant: "h3", sx: { color: "var(--theme-success)", mb: 1 }, children: ml((e == null ? void 0 : e.uptime) || 0) }),
        /* @__PURE__ */ t(v, { sx: { color: "var(--theme-text-secondary)" }, children: "Service has been running without interruption" })
      ] }) }) }),
      n && /* @__PURE__ */ t(Te, { size: { xs: 12 }, children: /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ s(j, { children: [
        /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 3 }, children: [
          /* @__PURE__ */ t(ul, { sx: { color: Lt(n.status) } }),
          /* @__PURE__ */ t(v, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: "Health Checks" }),
          /* @__PURE__ */ t(
            oe,
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
        /* @__PURE__ */ t(qe, { children: /* @__PURE__ */ s(Je, { size: "small", children: [
          /* @__PURE__ */ t(Qe, { children: /* @__PURE__ */ s(be, { children: [
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Check" }),
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Status" }),
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Latency" }),
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Last Checked" })
          ] }) }),
          /* @__PURE__ */ t(Ye, { children: Object.entries(n.checks).map(([w, x]) => /* @__PURE__ */ s(be, { children: [
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
              fl(x.status),
              /* @__PURE__ */ t(v, { fontWeight: 500, children: w })
            ] }) }),
            /* @__PURE__ */ t(_, { sx: { borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(
              oe,
              {
                label: x.status,
                size: "small",
                sx: {
                  bgcolor: Lt(x.status) + "20",
                  color: Lt(x.status),
                  textTransform: "capitalize"
                }
              }
            ) }),
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)" }, children: pl(x.latency) }),
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: new Date(x.lastChecked).toLocaleTimeString() })
          ] }, w)) })
        ] }) })
      ] }) }) }),
      /* @__PURE__ */ t(Te, { size: { xs: 12 }, children: /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ s(j, { children: [
        /* @__PURE__ */ t(v, { variant: "h6", sx: { color: "var(--theme-text-primary)", mb: 2 }, children: "Raw Diagnostics JSON (for AI agents)" }),
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
      Rn,
      {
        open: h.open,
        autoHideDuration: 2e3,
        onClose: () => u({ ...h, open: !1 }),
        anchorOrigin: { vertical: "bottom", horizontal: "center" },
        children: /* @__PURE__ */ t(q, { severity: "success", variant: "filled", children: h.message })
      }
    )
  ] });
}
const Rr = te(/* @__PURE__ */ t("path", {
  d: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z"
}), "Edit"), yl = te(/* @__PURE__ */ t("path", {
  d: "M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3m3-10H5V5h10z"
}), "Save"), bl = te(/* @__PURE__ */ t("path", {
  d: "M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2m5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12z"
}), "Cancel"), vl = te(/* @__PURE__ */ t("path", {
  d: "m12 8-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"
}), "ExpandLess");
function En(e) {
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
function xl(e) {
  switch (e) {
    case "enabled":
      return /* @__PURE__ */ t(ze, { sx: { color: "var(--theme-success)" } });
    case "error":
      return /* @__PURE__ */ t(Ee, { sx: { color: "var(--theme-error)" } });
    case "disabled":
    default:
      return /* @__PURE__ */ t(Vr, { sx: { color: "var(--theme-text-secondary)" } });
  }
}
const In = {
  domain: "",
  clientId: "",
  clientSecret: "",
  baseUrl: "",
  secret: "",
  audience: "",
  scopes: ["openid", "profile", "email"],
  allowedRoles: [],
  allowedDomains: []
}, $n = {
  url: "",
  anonKey: ""
}, An = {
  username: "",
  password: "",
  realm: "Protected Area"
}, Tn = {
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
function Cl() {
  var st, Le, Ie;
  const [e, r] = f(null), [n, a] = f(!0), [o, i] = f(null), [l, c] = f(null), [h, u] = f(!1), [p, g] = f(!1), [y, w] = f(!1), [x, T] = f(null), [$, N] = f(""), [O, I] = f(In), [b, k] = f($n), [D, U] = f(An), [M, B] = f(Tn), [de, L] = f(!0), [d, z] = f(""), [C, R] = f({
    enabled: !1,
    clientId: "",
    clientSecret: ""
  }), [V, he] = f({
    enabled: !1,
    clientId: "",
    clientSecret: ""
  }), [G, ve] = f({
    enabled: !1,
    clientId: "",
    clientSecret: "",
    keyId: "",
    teamId: ""
  }), [W, J] = f(!1), [Q, Z] = f(!1), P = Se(async () => {
    var A, X, We, Tt;
    a(!0), i(null);
    try {
      const we = await Y.getAuthConfig();
      if (r(we), we.runtimeConfig) {
        const $e = we.runtimeConfig;
        if (N($e.adapter || ""), L($e.settings.authRequired ?? !0), z(((A = $e.settings.excludePaths) == null ? void 0 : A.join(", ")) || ""), $e.config.auth0 && I({ ...In, ...$e.config.auth0 }), $e.config.supabase && k({ ...$n, ...$e.config.supabase }), $e.config.basic && U({ ...An, ...$e.config.basic }), $e.config.supertokens) {
          const ke = $e.config.supertokens;
          B({ ...Tn, ...ke }), (X = ke.socialProviders) != null && X.google && R({
            enabled: !0,
            clientId: ke.socialProviders.google.clientId,
            clientSecret: ke.socialProviders.google.clientSecret
          }), (We = ke.socialProviders) != null && We.github && he({
            enabled: !0,
            clientId: ke.socialProviders.github.clientId,
            clientSecret: ke.socialProviders.github.clientSecret
          }), (Tt = ke.socialProviders) != null && Tt.apple && ve({
            enabled: !0,
            clientId: ke.socialProviders.apple.clientId,
            clientSecret: ke.socialProviders.apple.clientSecret,
            keyId: ke.socialProviders.apple.keyId,
            teamId: ke.socialProviders.apple.teamId
          });
        }
      } else we.adapter && N(we.adapter);
    } catch (we) {
      i(we instanceof Error ? we.message : "Failed to fetch auth status");
    } finally {
      a(!1);
    }
  }, []);
  ie(() => {
    P();
  }, [P]);
  const ye = (A, X) => {
    navigator.clipboard.writeText(X), c(A), setTimeout(() => c(null), 2e3);
  }, Ce = () => {
    u(!0), T(null);
  }, ne = () => {
    u(!1), T(null), P();
  }, xe = (A) => JSON.parse(JSON.stringify(A)), _e = () => {
    switch ($) {
      case "auth0":
        return xe(O);
      case "supabase":
        return xe(b);
      case "basic":
        return xe(D);
      case "supertokens": {
        const A = { ...M }, X = {};
        return C.enabled && (X.google = {
          clientId: C.clientId,
          clientSecret: C.clientSecret
        }), V.enabled && (X.github = {
          clientId: V.clientId,
          clientSecret: V.clientSecret
        }), G.enabled && (X.apple = {
          clientId: G.clientId,
          clientSecret: G.clientSecret,
          keyId: G.keyId || "",
          teamId: G.teamId || ""
        }), Object.keys(X).length > 0 && (A.socialProviders = X), xe(A);
      }
      default:
        return {};
    }
  }, ot = async () => {
    if ($) {
      w(!0), T(null);
      try {
        const A = await Y.testAuthProvider({
          adapter: $,
          config: _e()
        });
        T(A);
      } catch (A) {
        T({
          success: !1,
          message: A instanceof Error ? A.message : "Test failed"
        });
      } finally {
        w(!1);
      }
    }
  }, pt = async () => {
    if (e != null && e.adapter) {
      w(!0), T(null);
      try {
        const A = await Y.testCurrentAuthProvider();
        T(A);
      } catch (A) {
        T({
          success: !1,
          message: A instanceof Error ? A.message : "Test failed"
        });
      } finally {
        w(!1);
      }
    }
  }, Fe = async () => {
    if ($) {
      g(!0), i(null);
      try {
        const A = {
          adapter: $,
          config: _e(),
          settings: {
            authRequired: de,
            excludePaths: d.split(",").map((X) => X.trim()).filter(Boolean)
          }
        };
        await Y.updateAuthConfig(A), u(!1), await P();
      } catch (A) {
        i(A instanceof Error ? A.message : "Failed to save configuration");
      } finally {
        g(!1);
      }
    }
  }, Ke = async () => {
    g(!0), i(null);
    try {
      await Y.deleteAuthConfig(), Z(!1), u(!1), await P();
    } catch (A) {
      i(A instanceof Error ? A.message : "Failed to delete configuration");
    } finally {
      g(!1);
    }
  };
  if (n)
    return /* @__PURE__ */ t(m, { sx: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }, children: /* @__PURE__ */ t(se, {}) });
  const it = e != null && e.config ? Object.entries(e.config) : [];
  return /* @__PURE__ */ s(m, { children: [
    /* @__PURE__ */ s(m, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }, children: [
      /* @__PURE__ */ t(v, { variant: "h4", sx: { color: "var(--theme-text-primary)" }, children: "Authentication" }),
      /* @__PURE__ */ t(m, { sx: { display: "flex", gap: 1 }, children: !h && /* @__PURE__ */ s(Be, { children: [
        /* @__PURE__ */ t(De, { title: "Edit Configuration", children: /* @__PURE__ */ t(Me, { onClick: Ce, sx: { color: "var(--theme-primary)" }, children: /* @__PURE__ */ t(Rr, {}) }) }),
        /* @__PURE__ */ t(De, { title: "Refresh", children: /* @__PURE__ */ t(Me, { onClick: P, sx: { color: "var(--theme-text-secondary)" }, children: /* @__PURE__ */ t(mt, {}) }) })
      ] }) })
    ] }),
    /* @__PURE__ */ t(v, { variant: "body2", sx: { mb: 4, color: "var(--theme-text-secondary)" }, children: h ? "Configure authentication provider" : "Auth plugin configuration status" }),
    o && /* @__PURE__ */ t(q, { severity: "error", sx: { mb: 2 }, onClose: () => i(null), children: o }),
    h ? /* @__PURE__ */ s(m, { children: [
      /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", mb: 3 }, children: /* @__PURE__ */ s(j, { children: [
        /* @__PURE__ */ t(v, { variant: "h6", sx: { color: "var(--theme-text-primary)", mb: 2 }, children: "Provider Selection" }),
        /* @__PURE__ */ s(rr, { fullWidth: !0, sx: { mb: 2 }, children: [
          /* @__PURE__ */ t(nr, { sx: { color: "var(--theme-text-secondary)" }, children: "Auth Provider" }),
          /* @__PURE__ */ s(
            ar,
            {
              value: $,
              onChange: (A) => N(A.target.value),
              label: "Auth Provider",
              sx: { color: "var(--theme-text-primary)" },
              children: [
                /* @__PURE__ */ t(Ae, { value: "", children: /* @__PURE__ */ t("em", { children: "None (Disabled)" }) }),
                /* @__PURE__ */ t(Ae, { value: "supertokens", children: "SuperTokens" }),
                /* @__PURE__ */ t(Ae, { value: "auth0", children: "Auth0" }),
                /* @__PURE__ */ t(Ae, { value: "supabase", children: "Supabase" }),
                /* @__PURE__ */ t(Ae, { value: "basic", children: "Basic Auth" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ s(m, { sx: { display: "flex", gap: 2, alignItems: "center" }, children: [
          /* @__PURE__ */ t(
            Bt,
            {
              control: /* @__PURE__ */ t(
                Mt,
                {
                  checked: de,
                  onChange: (A) => L(A.target.checked),
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
              onChange: (A) => z(A.target.value),
              size: "small",
              sx: { flex: 1, "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } },
              placeholder: "/api/health, /api/public/*"
            }
          )
        ] })
      ] }) }),
      $ === "auth0" && /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", mb: 3 }, children: /* @__PURE__ */ s(j, { children: [
        /* @__PURE__ */ t(v, { variant: "h6", sx: { color: "var(--theme-text-primary)", mb: 2 }, children: "Auth0 Configuration" }),
        /* @__PURE__ */ s(m, { sx: { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }, children: [
          /* @__PURE__ */ t(
            K,
            {
              label: "Domain",
              value: O.domain,
              onChange: (A) => I({ ...O, domain: A.target.value }),
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
              onChange: (A) => I({ ...O, clientId: A.target.value }),
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
              onChange: (A) => I({ ...O, clientSecret: A.target.value }),
              required: !0,
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          ),
          /* @__PURE__ */ t(
            K,
            {
              label: "Base URL",
              value: O.baseUrl,
              onChange: (A) => I({ ...O, baseUrl: A.target.value }),
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
              onChange: (A) => I({ ...O, secret: A.target.value }),
              required: !0,
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          ),
          /* @__PURE__ */ t(
            K,
            {
              label: "API Audience (optional)",
              value: O.audience || "",
              onChange: (A) => I({ ...O, audience: A.target.value }),
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          )
        ] })
      ] }) }),
      $ === "supabase" && /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", mb: 3 }, children: /* @__PURE__ */ s(j, { children: [
        /* @__PURE__ */ t(v, { variant: "h6", sx: { color: "var(--theme-text-primary)", mb: 2 }, children: "Supabase Configuration" }),
        /* @__PURE__ */ s(m, { sx: { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }, children: [
          /* @__PURE__ */ t(
            K,
            {
              label: "Project URL",
              value: b.url,
              onChange: (A) => k({ ...b, url: A.target.value }),
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
              value: b.anonKey,
              onChange: (A) => k({ ...b, anonKey: A.target.value }),
              required: !0,
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          )
        ] })
      ] }) }),
      $ === "basic" && /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", mb: 3 }, children: /* @__PURE__ */ s(j, { children: [
        /* @__PURE__ */ t(v, { variant: "h6", sx: { color: "var(--theme-text-primary)", mb: 2 }, children: "Basic Auth Configuration" }),
        /* @__PURE__ */ s(m, { sx: { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2 }, children: [
          /* @__PURE__ */ t(
            K,
            {
              label: "Username",
              value: D.username,
              onChange: (A) => U({ ...D, username: A.target.value }),
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
              onChange: (A) => U({ ...D, password: A.target.value }),
              required: !0,
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          ),
          /* @__PURE__ */ t(
            K,
            {
              label: "Realm (optional)",
              value: D.realm || "",
              onChange: (A) => U({ ...D, realm: A.target.value }),
              placeholder: "Protected Area",
              sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
            }
          )
        ] })
      ] }) }),
      $ === "supertokens" && /* @__PURE__ */ s(Be, { children: [
        /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", mb: 3 }, children: /* @__PURE__ */ s(j, { children: [
          /* @__PURE__ */ t(v, { variant: "h6", sx: { color: "var(--theme-text-primary)", mb: 2 }, children: "SuperTokens Configuration" }),
          /* @__PURE__ */ s(m, { sx: { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }, children: [
            /* @__PURE__ */ t(
              K,
              {
                label: "Connection URI",
                value: M.connectionUri,
                onChange: (A) => B({ ...M, connectionUri: A.target.value }),
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
                value: M.apiKey || "",
                onChange: (A) => B({ ...M, apiKey: A.target.value }),
                sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
              }
            ),
            /* @__PURE__ */ t(
              K,
              {
                label: "App Name",
                value: M.appName,
                onChange: (A) => B({ ...M, appName: A.target.value }),
                required: !0,
                sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
              }
            ),
            /* @__PURE__ */ t(
              K,
              {
                label: "API Domain",
                value: M.apiDomain,
                onChange: (A) => B({ ...M, apiDomain: A.target.value }),
                required: !0,
                placeholder: "http://localhost:3000",
                sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
              }
            ),
            /* @__PURE__ */ t(
              K,
              {
                label: "Website Domain",
                value: M.websiteDomain,
                onChange: (A) => B({ ...M, websiteDomain: A.target.value }),
                required: !0,
                placeholder: "http://localhost:3000",
                sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
              }
            ),
            /* @__PURE__ */ t(
              K,
              {
                label: "API Base Path",
                value: M.apiBasePath || "/auth",
                onChange: (A) => B({ ...M, apiBasePath: A.target.value }),
                sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
              }
            )
          ] }),
          /* @__PURE__ */ t(m, { sx: { mt: 2 }, children: /* @__PURE__ */ t(
            Bt,
            {
              control: /* @__PURE__ */ t(
                Mt,
                {
                  checked: M.enableEmailPassword ?? !0,
                  onChange: (A) => B({ ...M, enableEmailPassword: A.target.checked }),
                  sx: { "& .MuiSwitch-switchBase.Mui-checked": { color: "var(--theme-primary)" } }
                }
              ),
              label: "Enable Email/Password Auth",
              sx: { color: "var(--theme-text-primary)" }
            }
          ) })
        ] }) }),
        /* @__PURE__ */ s(F, { sx: { bgcolor: "var(--theme-surface)", mb: 3 }, children: [
          /* @__PURE__ */ t(j, { sx: { pb: W ? 2 : 0 }, children: /* @__PURE__ */ s(
            m,
            {
              sx: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer"
              },
              onClick: () => J(!W),
              children: [
                /* @__PURE__ */ t(v, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: "Social Login Providers" }),
                W ? /* @__PURE__ */ t(vl, {}) : /* @__PURE__ */ t(da, {})
              ]
            }
          ) }),
          /* @__PURE__ */ t(_a, { in: W, children: /* @__PURE__ */ s(j, { sx: { pt: 0 }, children: [
            /* @__PURE__ */ t(_n, { sx: { mb: 2 } }),
            /* @__PURE__ */ s(m, { sx: { mb: 3 }, children: [
              /* @__PURE__ */ t(
                Bt,
                {
                  control: /* @__PURE__ */ t(
                    Mt,
                    {
                      checked: C.enabled,
                      onChange: (A) => R({ ...C, enabled: A.target.checked }),
                      sx: { "& .MuiSwitch-switchBase.Mui-checked": { color: "var(--theme-primary)" } }
                    }
                  ),
                  label: "Google",
                  sx: { color: "var(--theme-text-primary)", mb: 1 }
                }
              ),
              C.enabled && /* @__PURE__ */ s(m, { sx: { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, ml: 4 }, children: [
                /* @__PURE__ */ t(
                  K,
                  {
                    label: "Client ID",
                    size: "small",
                    value: C.clientId,
                    onChange: (A) => R({ ...C, clientId: A.target.value }),
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
                    onChange: (A) => R({ ...C, clientSecret: A.target.value }),
                    sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ s(m, { sx: { mb: 3 }, children: [
              /* @__PURE__ */ t(
                Bt,
                {
                  control: /* @__PURE__ */ t(
                    Mt,
                    {
                      checked: V.enabled,
                      onChange: (A) => he({ ...V, enabled: A.target.checked }),
                      sx: { "& .MuiSwitch-switchBase.Mui-checked": { color: "var(--theme-primary)" } }
                    }
                  ),
                  label: "GitHub",
                  sx: { color: "var(--theme-text-primary)", mb: 1 }
                }
              ),
              V.enabled && /* @__PURE__ */ s(m, { sx: { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, ml: 4 }, children: [
                /* @__PURE__ */ t(
                  K,
                  {
                    label: "Client ID",
                    size: "small",
                    value: V.clientId,
                    onChange: (A) => he({ ...V, clientId: A.target.value }),
                    sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
                  }
                ),
                /* @__PURE__ */ t(
                  K,
                  {
                    label: "Client Secret",
                    size: "small",
                    type: "password",
                    value: V.clientSecret,
                    onChange: (A) => he({ ...V, clientSecret: A.target.value }),
                    sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ s(m, { children: [
              /* @__PURE__ */ t(
                Bt,
                {
                  control: /* @__PURE__ */ t(
                    Mt,
                    {
                      checked: G.enabled,
                      onChange: (A) => ve({ ...G, enabled: A.target.checked }),
                      sx: { "& .MuiSwitch-switchBase.Mui-checked": { color: "var(--theme-primary)" } }
                    }
                  ),
                  label: "Apple",
                  sx: { color: "var(--theme-text-primary)", mb: 1 }
                }
              ),
              G.enabled && /* @__PURE__ */ s(m, { sx: { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, ml: 4 }, children: [
                /* @__PURE__ */ t(
                  K,
                  {
                    label: "Client ID",
                    size: "small",
                    value: G.clientId,
                    onChange: (A) => ve({ ...G, clientId: A.target.value }),
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
                    onChange: (A) => ve({ ...G, clientSecret: A.target.value }),
                    sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
                  }
                ),
                /* @__PURE__ */ t(
                  K,
                  {
                    label: "Key ID",
                    size: "small",
                    value: G.keyId || "",
                    onChange: (A) => ve({ ...G, keyId: A.target.value }),
                    sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
                  }
                ),
                /* @__PURE__ */ t(
                  K,
                  {
                    label: "Team ID",
                    size: "small",
                    value: G.teamId || "",
                    onChange: (A) => ve({ ...G, teamId: A.target.value }),
                    sx: { "& .MuiInputBase-input": { color: "var(--theme-text-primary)" } }
                  }
                )
              ] })
            ] })
          ] }) })
        ] })
      ] }),
      x && /* @__PURE__ */ s(q, { severity: x.success ? "success" : "error", sx: { mb: 3 }, children: [
        /* @__PURE__ */ t(v, { variant: "body2", sx: { fontWeight: 600 }, children: x.success ? "Connection Successful" : "Connection Failed" }),
        /* @__PURE__ */ t(v, { variant: "body2", children: x.message }),
        ((st = x.details) == null ? void 0 : st.latency) && /* @__PURE__ */ s(v, { variant: "caption", sx: { display: "block", mt: 0.5 }, children: [
          "Latency: ",
          x.details.latency,
          "ms"
        ] })
      ] }),
      /* @__PURE__ */ s(m, { sx: { display: "flex", gap: 2, justifyContent: "space-between" }, children: [
        /* @__PURE__ */ s(m, { sx: { display: "flex", gap: 2 }, children: [
          /* @__PURE__ */ t(
            re,
            {
              variant: "outlined",
              startIcon: /* @__PURE__ */ t(bl, {}),
              onClick: ne,
              disabled: p,
              sx: {
                color: "var(--theme-text-secondary)",
                borderColor: "var(--theme-border)"
              },
              children: "Cancel"
            }
          ),
          (e == null ? void 0 : e.runtimeConfig) && /* @__PURE__ */ t(
            re,
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
        /* @__PURE__ */ s(m, { sx: { display: "flex", gap: 2 }, children: [
          /* @__PURE__ */ t(
            re,
            {
              variant: "outlined",
              startIcon: y ? /* @__PURE__ */ t(se, { size: 16 }) : /* @__PURE__ */ t(ft, {}),
              onClick: ot,
              disabled: !$ || y || p,
              sx: {
                color: "var(--theme-text-primary)",
                borderColor: "var(--theme-border)"
              },
              children: "Test Connection"
            }
          ),
          /* @__PURE__ */ t(
            re,
            {
              variant: "contained",
              startIcon: p ? /* @__PURE__ */ t(se, { size: 16, sx: { color: "white" } }) : /* @__PURE__ */ t(yl, {}),
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
    ] }) : /* @__PURE__ */ s(Be, { children: [
      /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", mb: 3 }, children: /* @__PURE__ */ s(j, { children: [
        /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", gap: 2, mb: 2 }, children: [
          xl((e == null ? void 0 : e.state) || "disabled"),
          /* @__PURE__ */ s(m, { sx: { flex: 1 }, children: [
            /* @__PURE__ */ s(v, { variant: "h6", sx: { color: "var(--theme-text-primary)" }, children: [
              "Status:",
              " ",
              /* @__PURE__ */ t(
                oe,
                {
                  label: ((Le = e == null ? void 0 : e.state) == null ? void 0 : Le.toUpperCase()) || "UNKNOWN",
                  size: "small",
                  sx: {
                    bgcolor: `${En((e == null ? void 0 : e.state) || "disabled")}20`,
                    color: En((e == null ? void 0 : e.state) || "disabled"),
                    fontWeight: 600
                  }
                }
              )
            ] }),
            (e == null ? void 0 : e.adapter) && /* @__PURE__ */ s(v, { variant: "body2", sx: { color: "var(--theme-text-secondary)", mt: 0.5 }, children: [
              "Adapter: ",
              /* @__PURE__ */ t("strong", { children: e.adapter })
            ] })
          ] }),
          (e == null ? void 0 : e.state) === "enabled" && (e == null ? void 0 : e.adapter) && /* @__PURE__ */ t(
            re,
            {
              variant: "outlined",
              size: "small",
              startIcon: y ? /* @__PURE__ */ t(se, { size: 14 }) : /* @__PURE__ */ t(ft, {}),
              onClick: pt,
              disabled: y,
              sx: {
                color: "var(--theme-text-primary)",
                borderColor: "var(--theme-border)"
              },
              children: "Test Connection"
            }
          )
        ] }),
        x && !h && /* @__PURE__ */ s(q, { severity: x.success ? "success" : "error", sx: { mb: 2 }, children: [
          /* @__PURE__ */ t(v, { variant: "body2", sx: { fontWeight: 600 }, children: x.success ? "Connection Successful" : "Connection Failed" }),
          /* @__PURE__ */ t(v, { variant: "body2", children: x.message }),
          ((Ie = x.details) == null ? void 0 : Ie.latency) && /* @__PURE__ */ s(v, { variant: "caption", sx: { display: "block", mt: 0.5 }, children: [
            "Latency: ",
            x.details.latency,
            "ms"
          ] })
        ] }),
        (e == null ? void 0 : e.state) === "enabled" && !(e != null && e.runtimeConfig) && /* @__PURE__ */ s(q, { severity: "success", sx: { mb: 2 }, children: [
          /* @__PURE__ */ t(v, { variant: "body2", sx: { fontWeight: 600 }, children: "Configured via Environment Variables" }),
          /* @__PURE__ */ t(v, { variant: "body2", children: 'Authentication is configured using environment variables. Click "Edit" to override with runtime configuration (requires PostgreSQL).' })
        ] }),
        (e == null ? void 0 : e.runtimeConfig) && /* @__PURE__ */ t(
          oe,
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
        (e == null ? void 0 : e.state) === "error" && e.error && /* @__PURE__ */ t(q, { severity: "error", sx: { mb: 2 }, children: e.error }),
        (e == null ? void 0 : e.missingVars) && e.missingVars.length > 0 && /* @__PURE__ */ s(q, { severity: "warning", sx: { mb: 2 }, children: [
          /* @__PURE__ */ t(v, { variant: "body2", sx: { fontWeight: 600, mb: 1 }, children: "Missing environment variables:" }),
          /* @__PURE__ */ t(m, { component: "ul", sx: { m: 0, pl: 2 }, children: e.missingVars.map((A) => /* @__PURE__ */ t("li", { children: /* @__PURE__ */ t("code", { children: A }) }, A)) })
        ] }),
        (e == null ? void 0 : e.state) === "disabled" && /* @__PURE__ */ s(q, { severity: "info", children: [
          /* @__PURE__ */ s(v, { variant: "body2", children: [
            "Authentication is disabled. Click the edit button to configure a provider, or set the",
            " ",
            /* @__PURE__ */ t("code", { children: "AUTH_ADAPTER" }),
            " environment variable."
          ] }),
          /* @__PURE__ */ s(v, { variant: "body2", sx: { mt: 1 }, children: [
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
      it.length > 0 && /* @__PURE__ */ s(F, { sx: { bgcolor: "var(--theme-surface)" }, children: [
        /* @__PURE__ */ t(j, { sx: { pb: 0 }, children: /* @__PURE__ */ t(v, { variant: "h6", sx: { color: "var(--theme-text-primary)", mb: 2 }, children: "Current Configuration" }) }),
        /* @__PURE__ */ t(qe, { children: /* @__PURE__ */ s(Je, { size: "small", children: [
          /* @__PURE__ */ t(Qe, { children: /* @__PURE__ */ s(be, { children: [
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
          /* @__PURE__ */ t(Ye, { children: it.map(([A, X]) => /* @__PURE__ */ s(be, { children: [
            /* @__PURE__ */ t(_, { sx: { borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(
              v,
              {
                sx: { color: "var(--theme-text-primary)", fontFamily: "monospace", fontSize: 13 },
                children: A
              }
            ) }),
            /* @__PURE__ */ t(_, { sx: { borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(
              v,
              {
                sx: {
                  color: X.includes("*") ? "var(--theme-text-secondary)" : "var(--theme-text-primary)",
                  fontFamily: "monospace",
                  fontSize: 13
                },
                children: X
              }
            ) }),
            /* @__PURE__ */ t(_, { sx: { borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(De, { title: l === A ? "Copied!" : "Copy value", children: /* @__PURE__ */ t(
              Me,
              {
                size: "small",
                onClick: () => ye(A, X),
                sx: { color: l === A ? "var(--theme-success)" : "var(--theme-text-secondary)" },
                children: /* @__PURE__ */ t(Kr, { fontSize: "small" })
              }
            ) }) })
          ] }, A)) })
        ] }) })
      ] }),
      (e == null ? void 0 : e.state) === "enabled" && it.length === 0 && /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(j, { children: /* @__PURE__ */ t(v, { sx: { color: "var(--theme-text-secondary)", textAlign: "center" }, children: "No configuration details available" }) }) })
    ] }),
    /* @__PURE__ */ s(Ze, { open: Q, onClose: () => Z(!1), children: [
      /* @__PURE__ */ t(et, { children: "Reset to Environment Variables?" }),
      /* @__PURE__ */ t(tt, { children: /* @__PURE__ */ t(v, { children: "This will delete the runtime configuration from the database. The auth plugin will fall back to environment variables on the next request." }) }),
      /* @__PURE__ */ s(rt, { children: [
        /* @__PURE__ */ t(re, { onClick: () => Z(!1), children: "Cancel" }),
        /* @__PURE__ */ t(re, { onClick: Ke, color: "error", disabled: p, children: p ? /* @__PURE__ */ t(se, { size: 20 }) : "Reset" })
      ] })
    ] })
  ] });
}
const wl = te(/* @__PURE__ */ t("path", {
  d: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
}), "Home");
function Sl() {
  const e = zn();
  return /* @__PURE__ */ s(
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
        /* @__PURE__ */ t(v, { variant: "h1", sx: { color: "var(--theme-primary)", mb: 2 }, children: "404" }),
        /* @__PURE__ */ t(v, { variant: "h5", sx: { color: "var(--theme-text-primary)", mb: 1 }, children: "Page Not Found" }),
        /* @__PURE__ */ t(v, { sx: { color: "var(--theme-text-secondary)", mb: 4 }, children: "The page you're looking for doesn't exist or has been moved." }),
        /* @__PURE__ */ t(
          re,
          {
            variant: "contained",
            startIcon: /* @__PURE__ */ t(wl, {}),
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
function kl({ version: e }) {
  return /* @__PURE__ */ t(m, { sx: { display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, py: 2 }, children: /* @__PURE__ */ s(H, { variant: "caption", customColor: "var(--theme-text-secondary)", children: [
    "Built with",
    " ",
    /* @__PURE__ */ t(
      Oa,
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
function El() {
  return [
    { id: "dashboard", label: "Dashboard", route: "/", icon: "dashboard" },
    { id: "logs", label: "Logs", route: "/logs", icon: "article" },
    { id: "auth", label: "Auth", route: "/auth", icon: "lock" },
    { id: "system", label: "System", route: "/system", icon: "settings" }
  ];
}
function Ml({
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
  basePath: p = "",
  // Keep for backwards compatibility but unused (API always at /api)
  children: g
}) {
  const [y, w] = f(""), x = [...Zs(), ...o], T = window.__API_BASE_PATH__ || "";
  Y.setBaseUrl(T), ie(() => {
    Y.getInfo().then((b) => w(b.version || "")).catch(() => {
    });
  }, [T]);
  const N = [
    ...l ? El().filter((b) => !c.includes(b.id)) : [],
    ...i
  ];
  return /* @__PURE__ */ t(ws, { initialComponents: x, children: /* @__PURE__ */ t(xs, { initialWidgets: a, children: /* @__PURE__ */ t(
    ja,
    {
      config: Ka,
      logo: r || /* @__PURE__ */ t(Fa, { name: e }),
      footerContent: n || /* @__PURE__ */ t(kl, { version: y }),
      enableScaffolding: !0,
      navigationItems: N,
      showThemeSwitcher: h,
      showPaletteSwitcher: u,
      children: /* @__PURE__ */ s(Ea, { children: [
        l && /* @__PURE__ */ s(Be, { children: [
          !c.includes("dashboard") && /* @__PURE__ */ t(Ot, { path: "/", element: /* @__PURE__ */ t(tl, {}) }),
          !c.includes("logs") && /* @__PURE__ */ t(Ot, { path: "/logs", element: /* @__PURE__ */ t(sl, {}) }),
          !c.includes("auth") && /* @__PURE__ */ t(Ot, { path: "/auth", element: /* @__PURE__ */ t(Cl, {}) }),
          !c.includes("system") && /* @__PURE__ */ t(Ot, { path: "/system", element: /* @__PURE__ */ t(gl, {}) })
        ] }),
        g,
        /* @__PURE__ */ t(Ot, { path: "*", element: /* @__PURE__ */ t(Sl, {}) })
      ] })
    }
  ) }) });
}
const Vt = te(/* @__PURE__ */ t("path", {
  d: "m21.41 11.58-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.06-.59-1.42M5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7"
}), "LocalOffer");
function Rl({
  title: e = "User Management",
  subtitle: r = "Manage users, bans, and entitlements",
  features: n,
  headerActions: a,
  onUserSelect: o
}) {
  const [i, l] = f({
    users: (n == null ? void 0 : n.users) ?? !0,
    bans: (n == null ? void 0 : n.bans) ?? !1,
    entitlements: (n == null ? void 0 : n.entitlements) ?? !1,
    entitlementsReadonly: (n == null ? void 0 : n.entitlementsReadonly) ?? !0
  }), [c, h] = f(!!n), [u, p] = f(0), [g, y] = f([]), [w, x] = f(0), [T, $] = f(0), [N, O] = f(25), [I, b] = f(""), [k, D] = f({}), [U, M] = f([]), [B, de] = f(0), [L, d] = f([]), [z, C] = f(0), [R, V] = f(!0), [he, G] = f(null), [ve, W] = f(null), [J, Q] = f(!1), [Z, P] = f({
    email: "",
    reason: "",
    expiresAt: ""
  }), [ye, Ce] = f(!1), [ne, xe] = f({
    email: "",
    name: "",
    role: "",
    expiresInDays: 7
  }), [_e, ot] = f(null), [pt, Fe] = f(!1), [Ke, it] = f(""), [st, Le] = f(!1), [Ie, A] = f(!1), [X, We] = f(null), [Tt, we] = f(null), [$e, ke] = f([]), [Pt, Gr] = f(""), [ha, qr] = f(!1);
  ie(() => {
    n || Y.detectFeatures().then((E) => {
      l(E), h(!0);
    }).catch(() => {
      h(!0);
    });
  }, [n]), ie(() => {
    c && i.entitlements && !i.entitlementsReadonly && Y.getAvailableEntitlements().then(ke).catch(() => {
    });
  }, [c, i.entitlements, i.entitlementsReadonly]);
  const Dt = Se(async () => {
    var E;
    if (i.users) {
      V(!0);
      try {
        const ee = await Y.getUsers({
          limit: N,
          page: T,
          search: I || void 0
        });
        if (y(ee.users || []), x(ee.total), G(null), i.entitlements && ((E = ee.users) != null && E.length)) {
          const zt = {};
          await Promise.all(
            ee.users.map(async (_t) => {
              try {
                const va = await Y.getEntitlements(_t.email);
                zt[_t.email] = va.entitlements.length;
              } catch {
                zt[_t.email] = 0;
              }
            })
          ), D((_t) => ({ ..._t, ...zt }));
        }
      } catch (ee) {
        G(ee instanceof Error ? ee.message : "Failed to fetch users");
      } finally {
        V(!1);
      }
    }
  }, [i.users, i.entitlements, T, N, I]), gt = Se(async () => {
    if (i.bans) {
      V(!0);
      try {
        const E = await Y.getBans();
        M(E.bans || []), de(E.total), G(null);
      } catch (E) {
        G(E instanceof Error ? E.message : "Failed to fetch bans");
      } finally {
        V(!1);
      }
    }
  }, [i.bans]), Jr = Se(async () => {
    if (i.users) {
      V(!0);
      try {
        const E = await Y.getInvitations();
        d(E.users || []), C(E.total), G(null);
      } catch (E) {
        G(E instanceof Error ? E.message : "Failed to fetch invitations");
      } finally {
        V(!1);
      }
    }
  }, [i.users]);
  ie(() => {
    c && (u === 0 && i.users ? Dt() : u === 1 && i.bans ? gt() : u === 2 && i.users && Jr());
  }, [u, c, i.users, i.bans, Dt, gt, Jr]), ie(() => {
    c && i.bans && gt();
  }, [c, i.bans, gt]), ie(() => {
    if (!c) return;
    const E = setTimeout(() => {
      u === 0 && i.users && ($(0), Dt());
    }, 300);
    return () => clearTimeout(E);
  }, [I, u, c, i.users, Dt]);
  const ua = async () => {
    try {
      await Y.banUser(Z.email, Z.reason, Z.expiresAt || void 0), W("User banned successfully"), Q(!1), P({ email: "", reason: "", expiresAt: "" }), gt();
    } catch (E) {
      G(E instanceof Error ? E.message : "Failed to ban user");
    }
  }, ma = async (E) => {
    if (confirm("Unban this user?"))
      try {
        await Y.unbanUser(E), W("User unbanned successfully"), gt();
      } catch {
        G("Failed to unban user");
      }
  }, fa = async () => {
    try {
      const E = await Y.inviteUser({
        email: ne.email,
        name: ne.name || void 0,
        role: ne.role || void 0,
        expiresInDays: ne.expiresInDays
      });
      ot({ token: E.token, inviteLink: E.inviteLink }), W("User invitation created successfully"), Dt();
    } catch (E) {
      G(E instanceof Error ? E.message : "Failed to invite user");
    }
  }, pa = () => {
    _e && (navigator.clipboard.writeText(_e.inviteLink), W("Invite link copied to clipboard"));
  }, Qr = () => {
    Ce(!1), xe({ email: "", name: "", role: "", expiresInDays: 7 }), ot(null);
  }, Yr = async () => {
    if (!Ke.trim()) {
      we("Please enter an email address");
      return;
    }
    Le(!0), we(null), We(null);
    try {
      const E = await Y.getEntitlements(Ke);
      We(E);
    } catch (E) {
      we(E instanceof Error ? E.message : "Failed to lookup entitlements");
    } finally {
      Le(!1);
    }
  }, ga = async () => {
    if (X) {
      A(!0);
      try {
        const E = await Y.refreshEntitlements(Ke);
        We(E);
      } catch {
        we("Failed to refresh entitlements");
      } finally {
        A(!1);
      }
    }
  }, ya = async () => {
    if (!(!Pt || !X)) {
      qr(!0);
      try {
        await Y.grantEntitlement(X.identifier, Pt), W(`Entitlement "${Pt}" granted`), Gr("");
        const E = await Y.refreshEntitlements(X.identifier);
        We(E), D((ee) => ({
          ...ee,
          [X.identifier]: E.entitlements.length
        }));
      } catch (E) {
        G(E instanceof Error ? E.message : "Failed to grant entitlement");
      } finally {
        qr(!1);
      }
    }
  }, ba = async (E) => {
    if (X && confirm(`Revoke "${E}" from ${X.identifier}?`))
      try {
        await Y.revokeEntitlement(X.identifier, E), W(`Entitlement "${E}" revoked`);
        const ee = await Y.refreshEntitlements(X.identifier);
        We(ee), D((zt) => ({
          ...zt,
          [X.identifier]: ee.entitlements.length
        }));
      } catch (ee) {
        G(ee instanceof Error ? ee.message : "Failed to revoke entitlement");
      }
  }, Xr = (E) => {
    E && (it(E), Le(!0), we(null), We(null), Y.getEntitlements(E).then(We).catch((ee) => we(ee instanceof Error ? ee.message : "Failed to lookup entitlements")).finally(() => Le(!1))), Fe(!0);
  }, yt = (E) => E ? new Date(E).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }) : "Never", wr = $e.filter(
    (E) => !(X != null && X.entitlements.includes(E.name))
  ), Nt = [];
  return i.users && Nt.push({ label: "Users", count: w }), i.bans && Nt.push({ label: "Banned", count: B }), i.users && Nt.push({ label: "Invitations", count: z }), c ? /* @__PURE__ */ s(m, { children: [
    /* @__PURE__ */ s(m, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }, children: [
      /* @__PURE__ */ s(m, { children: [
        /* @__PURE__ */ t(H, { variant: "h4", content: e, customColor: "var(--theme-text-primary)" }),
        /* @__PURE__ */ t(H, { variant: "body2", content: r, customColor: "var(--theme-text-secondary)" })
      ] }),
      /* @__PURE__ */ s(m, { sx: { display: "flex", gap: 1 }, children: [
        a,
        i.users && /* @__PURE__ */ t(
          me,
          {
            variant: "primary",
            icon: "person_add",
            label: "Invite User",
            onClick: () => Ce(!0)
          }
        ),
        i.entitlements && /* @__PURE__ */ t(
          me,
          {
            variant: "outlined",
            icon: "person_search",
            label: "Lookup Entitlements",
            onClick: () => Xr()
          }
        ),
        i.bans && /* @__PURE__ */ t(
          me,
          {
            variant: "outlined",
            color: "error",
            icon: "block",
            label: "Ban User",
            onClick: () => Q(!0)
          }
        )
      ] })
    ] }),
    R && /* @__PURE__ */ t(Gt, { sx: { mb: 2 } }),
    he && /* @__PURE__ */ t(q, { severity: "error", onClose: () => G(null), sx: { mb: 2 }, children: he }),
    ve && /* @__PURE__ */ t(q, { severity: "success", onClose: () => W(null), sx: { mb: 2 }, children: ve }),
    i.users && /* @__PURE__ */ s(lr, { columns: i.bans ? 3 : 2, spacing: "medium", sx: { mb: 3 }, equalHeight: !0, children: [
      /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(j, { children: /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        /* @__PURE__ */ t(ca, { sx: { fontSize: 40, color: "var(--theme-primary)" } }),
        /* @__PURE__ */ s(m, { children: [
          /* @__PURE__ */ t(H, { variant: "h4", content: w.toLocaleString(), customColor: "var(--theme-text-primary)" }),
          /* @__PURE__ */ t(H, { variant: "body2", content: "Total Users", customColor: "var(--theme-text-secondary)" })
        ] })
      ] }) }) }),
      i.entitlements && /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(j, { children: /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        /* @__PURE__ */ t(Vt, { sx: { fontSize: 40, color: "var(--theme-success)" } }),
        /* @__PURE__ */ s(m, { children: [
          /* @__PURE__ */ t(H, { variant: "body1", fontWeight: "500", content: "Entitlements", customColor: "var(--theme-text-primary)" }),
          /* @__PURE__ */ t(
            H,
            {
              variant: "body2",
              content: i.entitlementsReadonly ? "Read-only Mode" : "Plugin Active",
              customColor: i.entitlementsReadonly ? "var(--theme-warning)" : "var(--theme-success)"
            }
          )
        ] })
      ] }) }) }),
      i.bans && /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(j, { children: /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        /* @__PURE__ */ t(Vr, { sx: { fontSize: 40, color: B > 0 ? "var(--theme-error)" : "var(--theme-text-secondary)" } }),
        /* @__PURE__ */ s(m, { children: [
          /* @__PURE__ */ t(H, { variant: "h4", content: B.toString(), customColor: B > 0 ? "var(--theme-error)" : "var(--theme-text-primary)" }),
          /* @__PURE__ */ t(H, { variant: "body2", content: "Banned Users", customColor: "var(--theme-text-secondary)" })
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ s(F, { sx: { bgcolor: "var(--theme-surface)" }, children: [
      Nt.length > 1 && /* @__PURE__ */ t(
        Ba,
        {
          value: u,
          onChange: (E, ee) => p(ee),
          sx: { borderBottom: 1, borderColor: "var(--theme-border)", px: 2 },
          children: Nt.map((E, ee) => /* @__PURE__ */ t(Ma, { label: `${E.label}${E.count !== void 0 ? ` (${E.count})` : ""}` }, ee))
        }
      ),
      /* @__PURE__ */ s(j, { sx: { p: 0 }, children: [
        /* @__PURE__ */ t(m, { sx: { p: 2, borderBottom: 1, borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(
          K,
          {
            size: "small",
            placeholder: "Search by email or name...",
            value: I,
            onChange: (E) => b(E.target.value),
            InputProps: {
              startAdornment: /* @__PURE__ */ t(er, { position: "start", children: /* @__PURE__ */ t(Hr, { sx: { color: "var(--theme-text-secondary)" } }) })
            },
            sx: { minWidth: 300 }
          }
        ) }),
        u === 0 && i.users && /* @__PURE__ */ s(Be, { children: [
          /* @__PURE__ */ t(qe, { children: /* @__PURE__ */ s(Je, { children: [
            /* @__PURE__ */ t(Qe, { children: /* @__PURE__ */ s(be, { children: [
              /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "ID" }),
              /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Name" }),
              /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Email" }),
              i.entitlements && /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, align: "center", children: "Entitlements" }),
              /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Created" }),
              /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, align: "right", children: "Actions" })
            ] }) }),
            /* @__PURE__ */ s(Ye, { children: [
              g.map((E) => /* @__PURE__ */ s(
                be,
                {
                  hover: !0,
                  sx: { cursor: o ? "pointer" : "default" },
                  onClick: () => o == null ? void 0 : o(E),
                  children: [
                    /* @__PURE__ */ s(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", fontFamily: "monospace", fontSize: "0.75rem" }, children: [
                      E.id.substring(0, 8),
                      "..."
                    ] }),
                    /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(H, { variant: "body1", content: E.name || "--", fontWeight: "500" }) }),
                    /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)" }, children: E.email }),
                    i.entitlements && /* @__PURE__ */ t(_, { sx: { borderColor: "var(--theme-border)" }, align: "center", children: /* @__PURE__ */ t(
                      oe,
                      {
                        size: "small",
                        icon: /* @__PURE__ */ t(Vt, { sx: { fontSize: 14 } }),
                        label: k[E.email] ?? "...",
                        sx: {
                          bgcolor: "var(--theme-primary)20",
                          color: "var(--theme-primary)"
                        }
                      }
                    ) }),
                    /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: yt(E.created_at) }),
                    /* @__PURE__ */ t(_, { sx: { borderColor: "var(--theme-border)" }, align: "right", children: i.entitlements && /* @__PURE__ */ t(De, { title: "View entitlements", children: /* @__PURE__ */ t(Me, { size: "small", onClick: (ee) => {
                      ee.stopPropagation(), Xr(E.email);
                    }, children: /* @__PURE__ */ t(Vt, { fontSize: "small" }) }) }) })
                  ]
                },
                E.id
              )),
              g.length === 0 && !R && /* @__PURE__ */ t(be, { children: /* @__PURE__ */ t(_, { colSpan: i.entitlements ? 6 : 5, align: "center", sx: { py: 4, color: "var(--theme-text-secondary)" }, children: I ? "No users match your search" : "No users found" }) })
            ] })
          ] }) }),
          /* @__PURE__ */ t(
            Ra,
            {
              component: "div",
              count: w,
              page: T,
              onPageChange: (E, ee) => $(ee),
              rowsPerPage: N,
              onRowsPerPageChange: (E) => {
                O(parseInt(E.target.value, 10)), $(0);
              },
              rowsPerPageOptions: [10, 25, 50, 100],
              sx: { borderTop: 1, borderColor: "var(--theme-border)" }
            }
          )
        ] }),
        u === 1 && i.bans && /* @__PURE__ */ t(qe, { children: /* @__PURE__ */ s(Je, { children: [
          /* @__PURE__ */ t(Qe, { children: /* @__PURE__ */ s(be, { children: [
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Email" }),
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Reason" }),
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Banned At" }),
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Expires" }),
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Banned By" }),
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, align: "right", children: "Actions" })
          ] }) }),
          /* @__PURE__ */ s(Ye, { children: [
            U.map((E) => /* @__PURE__ */ s(be, { children: [
              /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(H, { variant: "body1", content: E.email, fontWeight: "500" }) }),
              /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", maxWidth: 200 }, children: /* @__PURE__ */ t(H, { variant: "body2", content: E.reason, noWrap: !0 }) }),
              /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: yt(E.banned_at) }),
              /* @__PURE__ */ t(_, { sx: { borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(
                oe,
                {
                  size: "small",
                  label: E.expires_at ? yt(E.expires_at) : "Permanent",
                  sx: {
                    bgcolor: E.expires_at ? "var(--theme-warning)20" : "var(--theme-error)20",
                    color: E.expires_at ? "var(--theme-warning)" : "var(--theme-error)"
                  }
                }
              ) }),
              /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: E.banned_by }),
              /* @__PURE__ */ t(_, { sx: { borderColor: "var(--theme-border)" }, align: "right", children: /* @__PURE__ */ t(
                me,
                {
                  buttonSize: "small",
                  variant: "text",
                  color: "success",
                  icon: "check_circle",
                  label: "Unban",
                  onClick: () => ma(E.email)
                }
              ) })
            ] }, E.id)),
            U.length === 0 && !R && /* @__PURE__ */ t(be, { children: /* @__PURE__ */ t(_, { colSpan: 6, align: "center", sx: { py: 4, color: "var(--theme-text-secondary)" }, children: "No users are currently banned" }) })
          ] })
        ] }) }),
        u === 2 && i.users && /* @__PURE__ */ t(qe, { children: /* @__PURE__ */ s(Je, { children: [
          /* @__PURE__ */ t(Qe, { children: /* @__PURE__ */ s(be, { children: [
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Email" }),
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Name" }),
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Created" }),
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Expires" }),
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Status" })
          ] }) }),
          /* @__PURE__ */ s(Ye, { children: [
            L.map((E) => {
              const ee = E.invitation_expires_at && new Date(E.invitation_expires_at) < /* @__PURE__ */ new Date();
              return /* @__PURE__ */ s(be, { children: [
                /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(H, { variant: "body1", content: E.email, fontWeight: "500" }) }),
                /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)" }, children: E.name || "--" }),
                /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: yt(E.created_at) }),
                /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: yt(E.invitation_expires_at) }),
                /* @__PURE__ */ t(_, { sx: { borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(
                  oe,
                  {
                    size: "small",
                    label: ee ? "Expired" : "Pending",
                    sx: {
                      bgcolor: ee ? "var(--theme-error)20" : "var(--theme-warning)20",
                      color: ee ? "var(--theme-error)" : "var(--theme-warning)"
                    }
                  }
                ) })
              ] }, E.id);
            }),
            L.length === 0 && !R && /* @__PURE__ */ t(be, { children: /* @__PURE__ */ t(_, { colSpan: 5, align: "center", sx: { py: 4, color: "var(--theme-text-secondary)" }, children: "No pending invitations" }) })
          ] })
        ] }) })
      ] })
    ] }),
    i.users && /* @__PURE__ */ s(
      St,
      {
        open: ye,
        onClose: Qr,
        maxWidth: "sm",
        fullWidth: !0,
        children: [
          /* @__PURE__ */ t(kt, { children: "Invite User" }),
          /* @__PURE__ */ t(Et, { children: _e ? /* @__PURE__ */ s(m, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [
            /* @__PURE__ */ t(q, { severity: "success", children: "Invitation created successfully! Share this link with the user:" }),
            /* @__PURE__ */ t(
              K,
              {
                label: "Invitation Link",
                fullWidth: !0,
                value: _e.inviteLink,
                InputProps: {
                  readOnly: !0,
                  endAdornment: /* @__PURE__ */ t(er, { position: "end", children: /* @__PURE__ */ t(De, { title: "Copy to clipboard", children: /* @__PURE__ */ t(Me, { onClick: pa, edge: "end", children: /* @__PURE__ */ t(Kr, {}) }) }) })
                },
                helperText: "Click the icon to copy the link to clipboard"
              }
            ),
            /* @__PURE__ */ t(q, { severity: "info", children: "The user will need to visit this link to activate their account." })
          ] }) : /* @__PURE__ */ s(m, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [
            /* @__PURE__ */ t(
              K,
              {
                label: "Email",
                fullWidth: !0,
                required: !0,
                value: ne.email,
                onChange: (E) => xe({ ...ne, email: E.target.value }),
                placeholder: "user@example.com",
                type: "email"
              }
            ),
            /* @__PURE__ */ t(
              K,
              {
                label: "Name (Optional)",
                fullWidth: !0,
                value: ne.name,
                onChange: (E) => xe({ ...ne, name: E.target.value }),
                placeholder: "Enter user's full name"
              }
            ),
            /* @__PURE__ */ t(
              K,
              {
                label: "Role (Optional)",
                fullWidth: !0,
                value: ne.role,
                onChange: (E) => xe({ ...ne, role: E.target.value }),
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
                value: ne.expiresInDays,
                onChange: (E) => xe({ ...ne, expiresInDays: parseInt(E.target.value) || 7 }),
                InputProps: {
                  endAdornment: /* @__PURE__ */ t(er, { position: "end", children: "days" })
                },
                helperText: "How many days until the invitation expires"
              }
            )
          ] }) }),
          /* @__PURE__ */ s(It, { children: [
            /* @__PURE__ */ t(
              me,
              {
                variant: "text",
                label: "Close",
                onClick: Qr
              }
            ),
            !_e && /* @__PURE__ */ t(
              me,
              {
                variant: "primary",
                label: "Create Invitation",
                onClick: fa,
                disabled: !ne.email
              }
            )
          ] })
        ]
      }
    ),
    i.bans && /* @__PURE__ */ s(
      St,
      {
        open: J,
        onClose: () => Q(!1),
        maxWidth: "sm",
        fullWidth: !0,
        children: [
          /* @__PURE__ */ t(kt, { children: "Ban User" }),
          /* @__PURE__ */ t(Et, { children: /* @__PURE__ */ s(m, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [
            /* @__PURE__ */ t(
              K,
              {
                label: "Email",
                fullWidth: !0,
                value: Z.email,
                onChange: (E) => P({ ...Z, email: E.target.value }),
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
                onChange: (E) => P({ ...Z, reason: E.target.value }),
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
                onChange: (E) => P({ ...Z, expiresAt: E.target.value }),
                InputLabelProps: { shrink: !0 },
                helperText: "Leave empty for permanent ban"
              }
            )
          ] }) }),
          /* @__PURE__ */ s(It, { children: [
            /* @__PURE__ */ t(
              me,
              {
                variant: "text",
                label: "Cancel",
                onClick: () => {
                  Q(!1), P({ email: "", reason: "", expiresAt: "" });
                }
              }
            ),
            /* @__PURE__ */ t(
              me,
              {
                variant: "primary",
                color: "error",
                label: "Ban User",
                onClick: ua,
                disabled: !Z.email || !Z.reason
              }
            )
          ] })
        ]
      }
    ),
    i.entitlements && /* @__PURE__ */ s(
      St,
      {
        open: pt,
        onClose: () => Fe(!1),
        maxWidth: "md",
        fullWidth: !0,
        children: [
          /* @__PURE__ */ t(kt, { children: "User Entitlements" }),
          /* @__PURE__ */ t(Et, { children: /* @__PURE__ */ s(m, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [
            /* @__PURE__ */ s(m, { sx: { display: "flex", gap: 1 }, children: [
              /* @__PURE__ */ t(
                K,
                {
                  label: "Email",
                  fullWidth: !0,
                  value: Ke,
                  onChange: (E) => it(E.target.value),
                  placeholder: "Enter user email",
                  onKeyDown: (E) => E.key === "Enter" && Yr()
                }
              ),
              /* @__PURE__ */ t(
                me,
                {
                  variant: "primary",
                  icon: "search",
                  label: "Lookup",
                  onClick: Yr,
                  disabled: st
                }
              )
            ] }),
            st && /* @__PURE__ */ t(m, { sx: { display: "flex", justifyContent: "center", py: 4 }, children: /* @__PURE__ */ t(se, {}) }),
            Tt && /* @__PURE__ */ t(q, { severity: "error", children: Tt }),
            X && /* @__PURE__ */ s(m, { children: [
              /* @__PURE__ */ s(m, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }, children: [
                /* @__PURE__ */ s(m, { children: [
                  /* @__PURE__ */ t(H, { variant: "h6", content: X.identifier, customColor: "var(--theme-text-primary)" }),
                  /* @__PURE__ */ t(H, { variant: "body2", content: `Source: ${X.source}`, customColor: "var(--theme-text-secondary)" })
                ] }),
                /* @__PURE__ */ t(
                  me,
                  {
                    variant: "outlined",
                    icon: "refresh",
                    label: Ie ? "Refreshing..." : "Refresh",
                    onClick: ga,
                    disabled: Ie,
                    buttonSize: "small"
                  }
                )
              ] }),
              !i.entitlementsReadonly && wr.length > 0 && /* @__PURE__ */ s(m, { sx: { display: "flex", gap: 1, mb: 2, p: 2, bgcolor: "var(--theme-background)", borderRadius: 1 }, children: [
                /* @__PURE__ */ t(
                  La,
                  {
                    size: "small",
                    options: wr,
                    getOptionLabel: (E) => E.name,
                    value: wr.find((E) => E.name === Pt) || null,
                    onChange: (E, ee) => Gr((ee == null ? void 0 : ee.name) || ""),
                    renderInput: (E) => /* @__PURE__ */ t(K, { ...E, label: "Grant Entitlement", placeholder: "Select entitlement" }),
                    sx: { flex: 1 }
                  }
                ),
                /* @__PURE__ */ t(
                  me,
                  {
                    variant: "primary",
                    icon: "add",
                    label: "Grant",
                    onClick: ya,
                    disabled: !Pt || ha,
                    buttonSize: "small"
                  }
                )
              ] }),
              /* @__PURE__ */ t(H, { variant: "subtitle2", content: "Current Entitlements", customColor: "var(--theme-text-secondary)", style: { marginBottom: "8px" } }),
              X.entitlements.length === 0 ? /* @__PURE__ */ t(H, { variant: "body2", content: "No entitlements found", customColor: "var(--theme-text-secondary)" }) : /* @__PURE__ */ t(m, { sx: { display: "flex", flexWrap: "wrap", gap: 1 }, children: X.entitlements.map((E, ee) => /* @__PURE__ */ t(
                oe,
                {
                  icon: /* @__PURE__ */ t(ze, { sx: { fontSize: 16 } }),
                  label: E,
                  onDelete: i.entitlementsReadonly ? void 0 : () => ba(E),
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
              /* @__PURE__ */ s(m, { sx: { mt: 2, pt: 2, borderTop: 1, borderColor: "var(--theme-border)" }, children: [
                /* @__PURE__ */ t(H, { variant: "caption", content: `Data from: ${X.source === "cache" ? "Cache" : "Source"}`, customColor: "var(--theme-text-secondary)" }),
                X.cachedAt && /* @__PURE__ */ t(H, { variant: "caption", content: ` | Cached: ${yt(X.cachedAt)}`, customColor: "var(--theme-text-secondary)" }),
                i.entitlementsReadonly && /* @__PURE__ */ t(H, { variant: "caption", content: " | Read-only mode (modifications disabled)", customColor: "var(--theme-warning)" })
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ t(It, { children: /* @__PURE__ */ t(me, { variant: "text", label: "Close", onClick: () => Fe(!1) }) })
        ]
      }
    )
  ] }) : /* @__PURE__ */ t(m, { sx: { display: "flex", justifyContent: "center", py: 8 }, children: /* @__PURE__ */ t(se, {}) });
}
const Pn = te(/* @__PURE__ */ t("path", {
  d: "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2m-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2m3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1z"
}), "Lock");
function Ll({
  title: e = "Entitlements",
  subtitle: r = "Manage available entitlements",
  headerActions: n
}) {
  var Z;
  const [a, o] = f(null), [i, l] = f(!0), [c, h] = f([]), [u, p] = f([]), [g, y] = f(!0), [w, x] = f(null), [T, $] = f(null), [N, O] = f(""), [I, b] = f(!1), [k, D] = f(!1), [U, M] = f(!1), [B, de] = f(null), [L, d] = f({
    name: "",
    category: "",
    description: ""
  }), [z, C] = f(!1);
  ie(() => {
    Y.getEntitlementsStatus().then(o).catch((P) => x(P instanceof Error ? P.message : "Failed to get status")).finally(() => l(!1));
  }, []);
  const R = Se(async () => {
    y(!0);
    try {
      const P = await Y.getAvailableEntitlements();
      h(P), x(null);
    } catch (P) {
      x(P instanceof Error ? P.message : "Failed to fetch entitlements");
    } finally {
      y(!1);
    }
  }, []);
  ie(() => {
    R();
  }, [R]), ie(() => {
    if (!N.trim())
      p(c);
    else {
      const P = N.toLowerCase();
      p(
        c.filter(
          (ye) => {
            var Ce, ne;
            return ye.name.toLowerCase().includes(P) || ((Ce = ye.category) == null ? void 0 : Ce.toLowerCase().includes(P)) || ((ne = ye.description) == null ? void 0 : ne.toLowerCase().includes(P));
          }
        )
      );
    }
  }, [c, N]);
  const V = [...new Set(c.map((P) => P.category || "Uncategorized"))], he = async () => {
    if (!L.name.trim()) {
      x("Name is required");
      return;
    }
    C(!0);
    try {
      $(`Entitlement "${L.name}" created`), b(!1), d({ name: "", category: "", description: "" }), R();
    } catch (P) {
      x(P instanceof Error ? P.message : "Failed to create entitlement");
    } finally {
      C(!1);
    }
  }, G = async () => {
    if (B) {
      C(!0);
      try {
        $(`Entitlement "${B.name}" updated`), D(!1), de(null), R();
      } catch (P) {
        x(P instanceof Error ? P.message : "Failed to update entitlement");
      } finally {
        C(!1);
      }
    }
  }, ve = async () => {
    if (B) {
      C(!0);
      try {
        $(`Entitlement "${B.name}" deleted`), M(!1), de(null), R();
      } catch (P) {
        x(P instanceof Error ? P.message : "Failed to delete entitlement");
      } finally {
        C(!1);
      }
    }
  }, W = (P) => {
    de(P), D(!0);
  }, J = (P) => {
    de(P), M(!0);
  }, Q = (a == null ? void 0 : a.readonly) ?? !0;
  return i ? /* @__PURE__ */ t(m, { sx: { display: "flex", justifyContent: "center", py: 8 }, children: /* @__PURE__ */ t(se, {}) }) : /* @__PURE__ */ s(m, { children: [
    /* @__PURE__ */ s(m, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }, children: [
      /* @__PURE__ */ s(m, { children: [
        /* @__PURE__ */ t(H, { variant: "h4", content: e, customColor: "var(--theme-text-primary)" }),
        /* @__PURE__ */ t(H, { variant: "body2", content: r, customColor: "var(--theme-text-secondary)" })
      ] }),
      /* @__PURE__ */ s(m, { sx: { display: "flex", gap: 1 }, children: [
        n,
        !Q && /* @__PURE__ */ t(
          me,
          {
            variant: "primary",
            icon: "add",
            label: "Add Entitlement",
            onClick: () => b(!0)
          }
        )
      ] })
    ] }),
    g && /* @__PURE__ */ t(Gt, { sx: { mb: 2 } }),
    w && /* @__PURE__ */ t(q, { severity: "error", onClose: () => x(null), sx: { mb: 2 }, children: w }),
    T && /* @__PURE__ */ t(q, { severity: "success", onClose: () => $(null), sx: { mb: 2 }, children: T }),
    /* @__PURE__ */ s(lr, { columns: 3, spacing: "medium", sx: { mb: 3 }, equalHeight: !0, children: [
      /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(j, { children: /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        /* @__PURE__ */ t(Vt, { sx: { fontSize: 40, color: "var(--theme-primary)" } }),
        /* @__PURE__ */ s(m, { children: [
          /* @__PURE__ */ t(H, { variant: "h4", content: c.length.toString(), customColor: "var(--theme-text-primary)" }),
          /* @__PURE__ */ t(H, { variant: "body2", content: "Total Entitlements", customColor: "var(--theme-text-secondary)" })
        ] })
      ] }) }) }),
      /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(j, { children: /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
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
            children: /* @__PURE__ */ t(H, { variant: "h6", content: V.length.toString(), customColor: "var(--theme-primary)" })
          }
        ),
        /* @__PURE__ */ s(m, { children: [
          /* @__PURE__ */ t(H, { variant: "body1", fontWeight: "500", content: "Categories", customColor: "var(--theme-text-primary)" }),
          /* @__PURE__ */ t(H, { variant: "body2", content: V.slice(0, 3).join(", "), customColor: "var(--theme-text-secondary)" })
        ] })
      ] }) }) }),
      /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ t(j, { children: /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        Q ? /* @__PURE__ */ t(Pn, { sx: { fontSize: 40, color: "var(--theme-warning)" } }) : /* @__PURE__ */ t(Rr, { sx: { fontSize: 40, color: "var(--theme-success)" } }),
        /* @__PURE__ */ s(m, { children: [
          /* @__PURE__ */ t(
            H,
            {
              variant: "body1",
              fontWeight: "500",
              content: Q ? "Read-only" : "Editable",
              customColor: Q ? "var(--theme-warning)" : "var(--theme-success)"
            }
          ),
          /* @__PURE__ */ t(H, { variant: "body2", content: `Source: ${((Z = a == null ? void 0 : a.sources[0]) == null ? void 0 : Z.name) || "Unknown"}`, customColor: "var(--theme-text-secondary)" })
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ s(j, { sx: { p: 0 }, children: [
      /* @__PURE__ */ t(m, { sx: { p: 2, borderBottom: 1, borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ t(
        K,
        {
          size: "small",
          placeholder: "Search entitlements...",
          value: N,
          onChange: (P) => O(P.target.value),
          InputProps: {
            startAdornment: /* @__PURE__ */ t(er, { position: "start", children: /* @__PURE__ */ t(Hr, { sx: { color: "var(--theme-text-secondary)" } }) })
          },
          sx: { minWidth: 300 }
        }
      ) }),
      /* @__PURE__ */ t(qe, { children: /* @__PURE__ */ s(Je, { children: [
        /* @__PURE__ */ t(Qe, { children: /* @__PURE__ */ s(be, { children: [
          /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Name" }),
          /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Category" }),
          /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, children: "Description" }),
          !Q && /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)" }, align: "right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ s(Ye, { children: [
          u.map((P) => /* @__PURE__ */ s(be, { hover: !0, children: [
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-primary)", borderColor: "var(--theme-border)" }, children: /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
              /* @__PURE__ */ t(Vt, { sx: { fontSize: 18, color: "var(--theme-primary)" } }),
              /* @__PURE__ */ t(H, { variant: "body1", content: P.name, fontWeight: "500" })
            ] }) }),
            /* @__PURE__ */ t(_, { sx: { borderColor: "var(--theme-border)" }, children: P.category ? /* @__PURE__ */ t(
              oe,
              {
                size: "small",
                label: P.category,
                sx: {
                  bgcolor: "var(--theme-primary)20",
                  color: "var(--theme-primary)"
                }
              }
            ) : /* @__PURE__ */ t(H, { variant: "body2", content: "--", customColor: "var(--theme-text-secondary)" }) }),
            /* @__PURE__ */ t(_, { sx: { color: "var(--theme-text-secondary)", borderColor: "var(--theme-border)", maxWidth: 300 }, children: P.description || "--" }),
            !Q && /* @__PURE__ */ s(_, { sx: { borderColor: "var(--theme-border)" }, align: "right", children: [
              /* @__PURE__ */ t(De, { title: "Edit", children: /* @__PURE__ */ t(Me, { size: "small", onClick: () => W(P), children: /* @__PURE__ */ t(Rr, { fontSize: "small" }) }) }),
              /* @__PURE__ */ t(De, { title: "Delete", children: /* @__PURE__ */ t(Me, { size: "small", onClick: () => J(P), sx: { color: "var(--theme-error)" }, children: /* @__PURE__ */ t(Qt, { fontSize: "small" }) }) })
            ] })
          ] }, P.id)),
          u.length === 0 && !g && /* @__PURE__ */ t(be, { children: /* @__PURE__ */ t(_, { colSpan: Q ? 3 : 4, align: "center", sx: { py: 4, color: "var(--theme-text-secondary)" }, children: N ? "No entitlements match your search" : "No entitlements defined" }) })
        ] })
      ] }) })
    ] }) }),
    a && a.sources.length > 0 && /* @__PURE__ */ t(F, { sx: { bgcolor: "var(--theme-surface)", mt: 3 }, children: /* @__PURE__ */ s(j, { children: [
      /* @__PURE__ */ t(H, { variant: "subtitle2", content: "Entitlement Sources", customColor: "var(--theme-text-secondary)", style: { marginBottom: "12px" } }),
      /* @__PURE__ */ t(m, { sx: { display: "flex", flexDirection: "column", gap: 1 }, children: a.sources.map((P, ye) => /* @__PURE__ */ s(m, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        /* @__PURE__ */ t(
          oe,
          {
            size: "small",
            label: P.primary ? "Primary" : "Additional",
            sx: {
              bgcolor: P.primary ? "var(--theme-primary)20" : "var(--theme-text-secondary)20",
              color: P.primary ? "var(--theme-primary)" : "var(--theme-text-secondary)"
            }
          }
        ),
        /* @__PURE__ */ t(H, { variant: "body1", content: P.name, fontWeight: "500", customColor: "var(--theme-text-primary)" }),
        P.description && /* @__PURE__ */ t(H, { variant: "body2", content: `- ${P.description}`, customColor: "var(--theme-text-secondary)" }),
        P.readonly && /* @__PURE__ */ t(
          oe,
          {
            size: "small",
            icon: /* @__PURE__ */ t(Pn, { sx: { fontSize: 14 } }),
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
    !Q && /* @__PURE__ */ s(
      St,
      {
        open: I,
        onClose: () => b(!1),
        maxWidth: "sm",
        fullWidth: !0,
        children: [
          /* @__PURE__ */ t(kt, { children: "Add Entitlement" }),
          /* @__PURE__ */ t(Et, { children: /* @__PURE__ */ s(m, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [
            /* @__PURE__ */ t(
              K,
              {
                label: "Name",
                fullWidth: !0,
                value: L.name,
                onChange: (P) => d({ ...L, name: P.target.value }),
                placeholder: "e.g., premium, pro, feature:analytics",
                required: !0
              }
            ),
            /* @__PURE__ */ t(
              K,
              {
                label: "Category (Optional)",
                fullWidth: !0,
                value: L.category,
                onChange: (P) => d({ ...L, category: P.target.value }),
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
                value: L.description,
                onChange: (P) => d({ ...L, description: P.target.value }),
                placeholder: "Describe what this entitlement grants access to"
              }
            )
          ] }) }),
          /* @__PURE__ */ s(It, { children: [
            /* @__PURE__ */ t(me, { variant: "text", label: "Cancel", onClick: () => b(!1) }),
            /* @__PURE__ */ t(
              me,
              {
                variant: "primary",
                label: "Create",
                onClick: he,
                disabled: !L.name.trim() || z
              }
            )
          ] })
        ]
      }
    ),
    !Q && B && /* @__PURE__ */ s(
      St,
      {
        open: k,
        onClose: () => D(!1),
        maxWidth: "sm",
        fullWidth: !0,
        children: [
          /* @__PURE__ */ t(kt, { children: "Edit Entitlement" }),
          /* @__PURE__ */ t(Et, { children: /* @__PURE__ */ s(m, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [
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
                onChange: (P) => de({ ...B, category: P.target.value })
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
                onChange: (P) => de({ ...B, description: P.target.value })
              }
            )
          ] }) }),
          /* @__PURE__ */ s(It, { children: [
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
    !Q && B && /* @__PURE__ */ s(
      St,
      {
        open: U,
        onClose: () => M(!1),
        maxWidth: "sm",
        fullWidth: !0,
        children: [
          /* @__PURE__ */ t(kt, { children: "Delete Entitlement" }),
          /* @__PURE__ */ s(Et, { children: [
            /* @__PURE__ */ t(
              H,
              {
                variant: "body1",
                content: `Are you sure you want to delete the entitlement "${B.name}"?`,
                customColor: "var(--theme-text-primary)"
              }
            ),
            /* @__PURE__ */ t(q, { severity: "warning", sx: { mt: 2 }, children: "This will remove the entitlement from all users who currently have it." })
          ] }),
          /* @__PURE__ */ s(It, { children: [
            /* @__PURE__ */ t(me, { variant: "text", label: "Cancel", onClick: () => M(!1) }),
            /* @__PURE__ */ t(
              me,
              {
                variant: "primary",
                color: "error",
                label: "Delete",
                onClick: ve,
                disabled: z
              }
            )
          ] })
        ]
      }
    )
  ] });
}
function Wl({
  token: e,
  title: r = "Accept Invitation",
  subtitle: n = "Activate your account",
  successMessage: a = "Your account has been activated successfully!",
  redirectUrl: o,
  redirectLabel: i = "Go to App",
  onSuccess: l,
  onError: c
}) {
  const [h, u] = f(!0), [p, g] = f(null), [y, w] = f(!1), [x, T] = f(null);
  ie(() => {
    (async () => {
      let O = e;
      if (O || (O = new URLSearchParams(window.location.search).get("token") || ""), !O) {
        g("No invitation token provided"), u(!1), c == null || c("No invitation token provided");
        return;
      }
      try {
        const I = await Y.acceptInvitation(O);
        T(I.user), w(!0), l == null || l(I.user);
      } catch (I) {
        const b = I instanceof Error ? I.message : "Failed to accept invitation";
        g(b), c == null || c(b);
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
      children: /* @__PURE__ */ t(F, { sx: { maxWidth: 500, width: "100%", bgcolor: "var(--theme-surface)" }, children: /* @__PURE__ */ s(j, { sx: { p: 4 }, children: [
        /* @__PURE__ */ s(m, { sx: { textAlign: "center", mb: 4 }, children: [
          /* @__PURE__ */ t(H, { variant: "h4", content: r, customColor: "var(--theme-text-primary)", style: { marginBottom: "8px" } }),
          /* @__PURE__ */ t(H, { variant: "body2", content: n, customColor: "var(--theme-text-secondary)" })
        ] }),
        h && /* @__PURE__ */ s(m, { sx: { display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 4 }, children: [
          /* @__PURE__ */ t(se, {}),
          /* @__PURE__ */ t(H, { variant: "body2", content: "Activating your account...", customColor: "var(--theme-text-secondary)" })
        ] }),
        p && !h && /* @__PURE__ */ s(m, { sx: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }, children: [
          /* @__PURE__ */ t(Ee, { sx: { fontSize: 64, color: "var(--theme-error)" } }),
          /* @__PURE__ */ t(q, { severity: "error", sx: { width: "100%" }, children: p }),
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
        y && !h && /* @__PURE__ */ s(m, { sx: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }, children: [
          /* @__PURE__ */ t(ze, { sx: { fontSize: 64, color: "var(--theme-success)" } }),
          /* @__PURE__ */ t(q, { severity: "success", sx: { width: "100%" }, children: a }),
          x && /* @__PURE__ */ s(m, { sx: { width: "100%", textAlign: "center" }, children: [
            /* @__PURE__ */ t(
              H,
              {
                variant: "body1",
                content: `Welcome, ${x.name || x.email}!`,
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
const jl = ({
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
  }, p = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white"
  };
  return c ? /* @__PURE__ */ t("div", { className: "rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6", children: /* @__PURE__ */ s("div", { className: "animate-pulse", children: [
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
    o.length > 0 && /* @__PURE__ */ t("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4", children: o.map((g, y) => /* @__PURE__ */ t(Wt, { ...g }, y)) }),
    i.length > 0 && /* @__PURE__ */ t("div", { className: "flex flex-wrap gap-2 mt-4", children: i.map((g, y) => /* @__PURE__ */ t(
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
      y
    )) })
  ] });
}, Fl = ({
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
  children: p,
  loading: g = !1,
  breadcrumbs: y
}) => {
  const w = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white"
  };
  return /* @__PURE__ */ s("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
    y && y.length > 0 && /* @__PURE__ */ t("nav", { className: "mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400", children: y.map((x, T) => /* @__PURE__ */ s(wa.Fragment, { children: [
      T > 0 && /* @__PURE__ */ t("span", { children: "/" }),
      x.href ? /* @__PURE__ */ t("a", { href: x.href, className: "hover:text-gray-900 dark:hover:text-gray-100", children: x.label }) : /* @__PURE__ */ t("span", { className: "text-gray-900 dark:text-gray-100 font-medium", children: x.label })
    ] }, T)) }),
    /* @__PURE__ */ t("div", { className: "mb-8", children: /* @__PURE__ */ s("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ s("div", { className: "flex items-start gap-4", children: [
        n && /* @__PURE__ */ t("div", { className: "text-4xl text-gray-600 dark:text-gray-400 mt-1", children: n }),
        /* @__PURE__ */ s("div", { children: [
          /* @__PURE__ */ t("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white", children: e }),
          r && /* @__PURE__ */ t("p", { className: "mt-2 text-gray-600 dark:text-gray-400", children: r })
        ] })
      ] }),
      i.length > 0 && /* @__PURE__ */ t("div", { className: "flex gap-2", children: i.map((x, T) => /* @__PURE__ */ s(
        "button",
        {
          onClick: x.onClick,
          className: `
                    flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
                    transition-colors
                    ${w[x.variant || "secondary"]}
                  `,
          children: [
            x.icon,
            x.label
          ]
        },
        T
      )) })
    ] }) }),
    c && c.length > 0 && /* @__PURE__ */ t("div", { className: "mb-6 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ t("nav", { className: "flex space-x-8", children: c.map((x) => /* @__PURE__ */ t(
      "button",
      {
        onClick: () => u == null ? void 0 : u(x.id),
        className: `
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${h === x.id ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"}
                `,
        children: x.label
      },
      x.id
    )) }) }),
    (o || l) && /* @__PURE__ */ s("div", { className: "mb-6 flex flex-col sm:flex-row gap-4", children: [
      o && /* @__PURE__ */ t("div", { className: "flex-1", children: /* @__PURE__ */ t(
        "input",
        {
          type: "search",
          placeholder: a || "Search...",
          onChange: (x) => o(x.target.value),
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
}, Ul = ({
  title: e,
  description: r,
  config: n,
  schema: a,
  onSave: o,
  onReset: i,
  loading: l = !1,
  readOnly: c = !1
}) => {
  const [h, u] = f(n), [p, g] = f({}), [y, w] = f(!1), [x, T] = f(!1);
  ie(() => {
    u(n);
  }, [n]);
  const $ = (b, k) => b.required && (k == null || k === "") ? `${b.label} is required` : b.pattern && typeof k == "string" && !b.pattern.test(k) ? `${b.label} format is invalid` : b.validate ? b.validate(k) : null, N = (b, k) => {
    u({ ...h, [b]: k }), T(!1), p[b] && g({ ...p, [b]: "" });
  }, O = async () => {
    const b = {};
    if (a.forEach((k) => {
      const D = $(k, h[k.key]);
      D && (b[k.key] = D);
    }), Object.keys(b).length > 0) {
      g(b);
      return;
    }
    w(!0);
    try {
      await o(h), T(!0), setTimeout(() => T(!1), 3e3);
    } catch (k) {
      console.error("Failed to save config:", k);
    } finally {
      w(!1);
    }
  }, I = (b) => {
    var M;
    const k = h[b.key], U = `
      w-full px-3 py-2 rounded-md border
      ${!!p[b.key] ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"}
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
              checked: !!k,
              onChange: (B) => N(b.key, B.target.checked),
              disabled: c || l,
              className: "rounded"
            }
          ),
          /* @__PURE__ */ t("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: b.description || "Enable" })
        ] });
      case "select":
        return /* @__PURE__ */ t(
          "select",
          {
            value: String(k ?? ""),
            onChange: (B) => N(b.key, B.target.value),
            disabled: c || l,
            className: U,
            children: (M = b.options) == null ? void 0 : M.map((B) => /* @__PURE__ */ t("option", { value: B.value, children: B.label }, B.value))
          }
        );
      case "textarea":
        return /* @__PURE__ */ t(
          "textarea",
          {
            value: String(k ?? ""),
            onChange: (B) => N(b.key, B.target.value),
            disabled: c || l,
            rows: 4,
            className: U
          }
        );
      case "number":
        return /* @__PURE__ */ t(
          "input",
          {
            type: "number",
            value: Number(k ?? 0),
            onChange: (B) => N(b.key, Number(B.target.value)),
            min: b.min,
            max: b.max,
            step: b.step,
            disabled: c || l,
            className: U
          }
        );
      case "text":
      default:
        return /* @__PURE__ */ t(
          "input",
          {
            type: "text",
            value: String(k ?? ""),
            onChange: (B) => N(b.key, B.target.value),
            disabled: c || l,
            className: U
          }
        );
    }
  };
  return /* @__PURE__ */ s("div", { className: "rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6", children: [
    /* @__PURE__ */ s("div", { className: "mb-6", children: [
      /* @__PURE__ */ t("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: e }),
      r && /* @__PURE__ */ t("p", { className: "mt-1 text-gray-600 dark:text-gray-400", children: r })
    ] }),
    /* @__PURE__ */ t("div", { className: "space-y-6", children: a.map((b) => /* @__PURE__ */ s("div", { children: [
      b.type !== "boolean" && /* @__PURE__ */ s("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: [
        b.label,
        b.required && /* @__PURE__ */ t("span", { className: "text-red-500 ml-1", children: "*" })
      ] }),
      I(b),
      b.description && b.type !== "boolean" && /* @__PURE__ */ t("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: b.description }),
      p[b.key] && /* @__PURE__ */ t("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: p[b.key] })
    ] }, b.key)) }),
    !c && /* @__PURE__ */ s("div", { className: "mt-6 flex items-center gap-3", children: [
      /* @__PURE__ */ t(
        "button",
        {
          onClick: O,
          disabled: y || l,
          className: `
              px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white
              rounded-md text-sm font-medium
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            `,
          children: y ? "Saving..." : "Save Changes"
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          onClick: i,
          disabled: y || l,
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
      x && /* @__PURE__ */ t("span", { className: "text-sm text-green-600 dark:text-green-400", children: "✓ Saved successfully" })
    ] })
  ] });
};
export {
  Wl as AcceptInvitationPage,
  Ml as ControlPanelApp,
  tl as DashboardPage,
  xs as DashboardWidgetProvider,
  Cs as DashboardWidgetRenderer,
  Kl as DataTable,
  Ll as EntitlementsPage,
  sl as LogsPage,
  Sl as NotFoundPage,
  Ul as PluginConfigPanel,
  Fl as PluginManagementPage,
  jl as PluginStatusWidget,
  ks as PluginWidgetRenderer,
  $s as ServiceHealthWidget,
  Gl as StatCard,
  gl as SystemPage,
  Rl as UsersPage,
  ws as WidgetComponentRegistryProvider,
  Y as api,
  Zs as getBuiltInWidgetComponents,
  sa as useDashboardWidgets,
  Bl as useRegisterWidget,
  Ss as useWidgetComponentRegistry
};
//# sourceMappingURL=index.js.map
