<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="50 -80 400 100" width="500" height="200">
    <defs>
      <pattern id="cat-stripes" patternUnits="userSpaceOnUse" width="18.5" height="18.5" patternTransform="rotate(42)">
        <rect width="100%" height="100%" fill="#7D4C34" />
        <line x1="0" y="0" x2="0" y2="18.5" stroke="#D38031" stroke-width="25" />
      </pattern>
    </defs>

    <path id="curve" d="M 73.2 29.72 c 4 -1.22 65.5 -19.36 178.6 -19.12 c 111.3 0.24 170.8 18.06 175.1 19.4" />
    <g fill="url(#cat-stripes)">
      <text id="headerText" width="500">
        <textPath xlink:href="#curve">Catpressor!</textPath>
      </text>
    </g>
  </svg>
</template>
<style scoped>
#curve {
  fill: transparent;
}
#headerText {
  font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif;
  font-weight: bold;
  font-size: 75px;
  paint-order: stroke;
  stroke: #96700a;
  stroke-width: 3px;
  stroke-linecap: butt;
  stroke-linejoin: miter;
  font-weight: 800;

  background-image: linear-gradient(
    45deg,
    #967c45 25%,
    #e8b674 25%,
    #e8b674 50%,
    #967c45 50%,
    #967c45 75%,
    #e8b674 75%,
    #e8b674 100%
  );
}
</style>
