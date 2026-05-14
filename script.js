const fondoImg = document.getElementById("fondo");
const baseImg = document.getElementById("base");
const maquinaImg = document.getElementById("maquina");
const fechaTexto = document.getElementById("fechaTexto");
const fechaUltimosUno = document.getElementById("fechaUltimosUno");
const fechaUltimosDos = document.getElementById("fechaUltimosDos");
const giftPremioTexto = document.getElementById("giftPremioTexto");
const giftParaTexto = document.getElementById("giftParaTexto");
const giftDeTexto = document.getElementById("giftDeTexto");
const exportDiv = document.getElementById("export");

const tabButtons = document.querySelectorAll(".tab-button");
const sections = document.querySelectorAll(".workspace");

const piezas = {
  recordatorio: {
    maquina: document.getElementById("recordatorioMaquina"),
    fecha: document.getElementById("recordatorioFecha"),
    preview: document.getElementById("recordatorioPreview"),
    empty: document.getElementById("recordatorioEmpty"),
    botones: document.getElementById("recordatorioBotones"),
    canvas: null
  },
  ultimos: {
    maquina: document.getElementById("ultimosMaquina"),
    fecha: document.getElementById("ultimosFecha"),
    preview: document.getElementById("ultimosPreview"),
    empty: document.getElementById("ultimosEmpty"),
    botones: document.getElementById("ultimosBotones"),
    canvas: null
  },
  gift: {
    premio: document.getElementById("giftPremioInput"),
    para: document.getElementById("giftParaInput"),
    de: document.getElementById("giftDeInput"),
    preview: document.getElementById("giftPreview"),
    empty: document.getElementById("giftEmpty"),
    botones: document.getElementById("giftBotones"),
    canvas: null
  }
};

function obtenerEstacion(fechaStr) {
  const fecha = new Date(`${fechaStr}T12:00:00`);
  const anio = fecha.getFullYear();

  const estaciones = {
    otono: new Date(`${anio}-03-21T00:00:00`),
    invierno: new Date(`${anio}-06-21T00:00:00`),
    primavera: new Date(`${anio}-09-21T00:00:00`),
    verano: new Date(`${anio}-12-21T00:00:00`)
  };

  if (fecha >= estaciones.verano || fecha < estaciones.otono) return "verano";
  if (fecha >= estaciones.otono && fecha < estaciones.invierno) return "otono";
  if (fecha >= estaciones.invierno && fecha < estaciones.primavera) return "invierno";
  return "primavera";
}

function formatearFecha(fechaStr) {
  const dias = ["domingo", "lunes", "martes", "mi\u00e9rcoles", "jueves", "viernes", "s\u00e1bado"];
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

  const fecha = new Date(`${fechaStr}T12:00:00`);
  const diaSemana = dias[fecha.getDay()];
  const dia = fecha.getDate();
  const mes = meses[fecha.getMonth()];
  const anio = fecha.getFullYear();

  return `${diaSemana.toUpperCase()} ${dia} DE ${mes.toUpperCase()} ${anio}`;
}

function formatearFechaCorta(fechaStr) {
  const dias = ["domingo", "lunes", "martes", "mi\u00e9rcoles", "jueves", "viernes", "s\u00e1bado"];
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

  const fecha = new Date(`${fechaStr}T12:00:00`);
  const diaSemana = dias[fecha.getDay()];
  const dia = fecha.getDate();
  const mes = meses[fecha.getMonth()];

  return `${diaSemana.toUpperCase()} ${dia} ${mes.toUpperCase()}`;
}

function cargarImagen(img) {
  return new Promise((resolve, reject) => {
    img.onerror = () => reject(new Error(`Error cargando imagen: ${img.src}`));
    if (img.complete && img.naturalWidth > 0) {
      resolve();
    } else {
      img.onload = resolve;
    }
  });
}

function resetearVistaPrevia(tipo) {
  const pieza = piezas[tipo];
  pieza.canvas = null;
  pieza.preview.hidden = true;
  pieza.empty.hidden = false;
  pieza.botones.hidden = true;
}

function ocultarCapasTexto() {
  fechaTexto.hidden = true;
  fechaUltimosUno.hidden = true;
  fechaUltimosDos.hidden = true;
  giftPremioTexto.hidden = true;
  giftParaTexto.hidden = true;
  giftDeTexto.hidden = true;
}

function configurarExport(tipo, maquina, fecha) {
  const textoFecha = formatearFecha(fecha);
  const textoFechaCorta = formatearFechaCorta(fecha);
  fechaTexto.textContent = textoFecha;
  fechaUltimosUno.textContent = textoFechaCorta;
  fechaUltimosDos.textContent = textoFechaCorta;
  ocultarCapasTexto();

  if (tipo === "recordatorio") {
    fondoImg.src = `fondos/recordatorio/${obtenerEstacion(fecha)}.png`;
    baseImg.src = "base/base.png";
    maquinaImg.src = `maquinas/${maquina}.png`;
    baseImg.hidden = false;
    maquinaImg.hidden = false;
    fechaTexto.hidden = false;
    return [fondoImg, baseImg, maquinaImg];
  }

  fondoImg.src = `fondos/ultimos/${maquina}.png`;
  baseImg.hidden = true;
  maquinaImg.hidden = true;
  fechaUltimosUno.hidden = false;
  fechaUltimosDos.hidden = false;
  return [fondoImg];
}

function configurarGiftCard() {
  const pieza = piezas.gift;
  const premio = pieza.premio.value.trim();
  const para = pieza.para.value.trim();
  const de = pieza.de.value.trim();

  fondoImg.src = "fondos/gif.png";
  baseImg.hidden = true;
  maquinaImg.hidden = true;
  ocultarCapasTexto();

  giftPremioTexto.textContent = premio || "PREMIO";
  giftParaTexto.textContent = para || "PARA";
  giftDeTexto.textContent = de || "DE";
  giftPremioTexto.hidden = false;
  giftParaTexto.hidden = false;
  giftDeTexto.hidden = false;

  return [fondoImg];
}

function actualizarVista(tipo) {
  const pieza = piezas[tipo];
  if (tipo === "gift") {
    const tieneTexto = pieza.premio.value.trim() || pieza.para.value.trim() || pieza.de.value.trim();

    if (!tieneTexto) {
      resetearVistaPrevia(tipo);
      return;
    }

    Promise.all([
      document.fonts.ready,
      ...configurarGiftCard().map(cargarImagen)
    ])
      .then(() => generarVistaPrevia(tipo))
      .catch(() => alert("Error cargando im\u00e1genes. Verific\u00e1 nombres y rutas."));
    return;
  }

  const maquina = pieza.maquina.value;
  const fecha = pieza.fecha.value;

  if (!maquina || !fecha) {
    resetearVistaPrevia(tipo);
    return;
  }

  const imagenes = configurarExport(tipo, maquina, fecha);

  Promise.all([
    document.fonts.ready,
    ...imagenes.map(cargarImagen)
  ])
    .then(() => generarVistaPrevia(tipo))
    .catch(() => alert("Error cargando im\u00e1genes. Verific\u00e1 nombres y rutas."));
}

function generarVistaPrevia(tipo) {
  const pieza = piezas[tipo];
  exportDiv.style.visibility = "visible";

  html2canvas(exportDiv, {
    useCORS: true,
    backgroundColor: null
  }).then(canvas => {
    exportDiv.style.visibility = "hidden";
    pieza.canvas = canvas;

    pieza.preview.innerHTML = "";
    const img = document.createElement("img");
    img.src = canvas.toDataURL("image/png");
    img.alt = `Vista previa de ${tipo}`;

    pieza.preview.appendChild(img);
    pieza.preview.hidden = false;
    pieza.empty.hidden = true;
    pieza.botones.hidden = false;
  }).catch(err => {
    exportDiv.style.visibility = "hidden";
    console.error("Error generando imagen:", err);
    alert("No se pudo generar la imagen.");
  });
}

function descargarImagen(tipo) {
  const pieza = piezas[tipo];

  if (!pieza.canvas) {
    alert("Primero gener\u00e1 la imagen correctamente.");
    return;
  }

  pieza.canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const detalleArchivo = tipo === "gift"
      ? pieza.para.value.trim().replaceAll(" ", "_").toLowerCase() || "gift_card"
      : `${pieza.maquina.value}_${pieza.fecha.value.replaceAll("-", "_")}`;

    link.href = url;
    link.download = `${tipo}_${detalleArchivo}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
}

function cambiarSeccion(sectionName) {
  tabButtons.forEach(button => {
    button.classList.toggle("active", button.dataset.section === sectionName);
  });

  sections.forEach(section => {
    const isActive = section.id === `section-${sectionName}`;
    section.classList.toggle("active", isActive);
    section.hidden = !isActive;
  });
}

tabButtons.forEach(button => {
  button.addEventListener("click", () => cambiarSeccion(button.dataset.section));
});

Object.entries(piezas).forEach(([tipo, pieza]) => {
  if (tipo === "gift") {
    pieza.premio.addEventListener("input", () => actualizarVista(tipo));
    pieza.para.addEventListener("input", () => actualizarVista(tipo));
    pieza.de.addEventListener("input", () => actualizarVista(tipo));
    return;
  }

  pieza.maquina.addEventListener("change", () => actualizarVista(tipo));
  pieza.fecha.addEventListener("input", () => actualizarVista(tipo));
});

document.querySelectorAll("[data-download]").forEach(button => {
  button.addEventListener("click", () => descargarImagen(button.dataset.download));
});
