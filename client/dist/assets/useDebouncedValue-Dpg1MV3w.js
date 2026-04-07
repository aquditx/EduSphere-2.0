import{r as u}from"./index-vz5tMNGG.js";function n(e,t=300){const[o,r]=u.useState(e);return u.useEffect(()=>{const s=setTimeout(()=>r(e),t);return()=>clearTimeout(s)},[e,t]),o}export{n as u};
