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
const agendaArte = document.getElementById("agendaArte");

const tabButtons = document.querySelectorAll(".section-tabs [data-section]");
const sections = document.querySelectorAll(".workspace");

const piezas = {
  agenda: {
    maquina: document.getElementById("agendaMaquina"),
    fecha: document.getElementById("agendaFecha"),
    estado: document.getElementById("agendaEstado"),
    preview: document.getElementById("agendaPreview"),
    empty: document.getElementById("agendaEmpty"),
    botones: document.getElementById("agendaBotones"),
    canvas: null
  },
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

async function cargarFuentesExport(documento = document) {
  await documento.fonts.ready;
  const capas = documento.querySelectorAll("#export .fecha, #export .gift-text, #export .agenda-texto");
  await Promise.all(Array.from(capas, capa => {
    if (capa.hidden || capa.closest("[hidden]")) return;
    const estilo = documento.defaultView.getComputedStyle(capa);
    return documento.fonts.load(
      `${estilo.fontStyle} ${estilo.fontWeight} ${estilo.fontSize} "korolev"`,
      capa.textContent.toUpperCase()
    ).then(fuentes => {
      if (!fuentes.length) {
        throw new Error("No se pudo cargar la fuente Korolev de Adobe Fonts.");
      }
    });
  }));
}

function resetearVistaPrevia(tipo) {
  const pieza = piezas[tipo];
  pieza.canvas = null;
  pieza.canvases = [];
  pieza.preview.hidden = true;
  pieza.empty.hidden = false;
  pieza.botones.hidden = true;
}

function ocultarCapasTexto() {
  agendaArte.hidden = true;
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

  giftPremioTexto.querySelector(".gift-valor").textContent = premio;
  giftParaTexto.querySelector(".gift-valor").textContent = para;
  giftDeTexto.querySelector(".gift-valor").textContent = de;
  giftPremioTexto.hidden = !premio;
  giftParaTexto.hidden = !para;
  giftDeTexto.hidden = !de;

  return [fondoImg];
}

function ajustarTextoGift(elemento, alturaDisponible, tamanoMaximo) {
  // Medir con Korolev ya cargada, incluyendo saltos y palabras sin espacios.
  let minimo = 1;
  let maximo = tamanoMaximo;
  let elegido = minimo;
  while (minimo <= maximo) {
    const tamano = Math.floor((minimo + maximo) / 2);
    elemento.style.fontSize = `${tamano}px`;
    if (elemento.scrollHeight <= alturaDisponible && elemento.scrollWidth <= elemento.clientWidth) {
      elegido = tamano;
      minimo = tamano + 1;
    } else {
      maximo = tamano - 1;
    }
  }
  elemento.style.fontSize = `${elegido}px`;
}

function ajustarGiftCard() {
  [giftPremioTexto, giftParaTexto, giftDeTexto].forEach(capa => {
    if (capa.hidden) return;
    const estilo = getComputedStyle(capa);
    const etiqueta = capa.querySelector(".gift-etiqueta");
    const altura = capa.clientHeight - parseFloat(estilo.paddingTop) - parseFloat(estilo.paddingBottom)
      - (etiqueta ? etiqueta.offsetHeight + 8 : 0);
    ajustarTextoGift(capa.querySelector(".gift-valor"), altura, capa === giftPremioTexto ? 72 : 50);
  });
}

function obtenerFechasAgenda() {
  return Array.from(document.querySelectorAll("#agendaFechas .agenda-fila"), fila => ({
    fecha: fila.querySelector('input[type="date"]').value,
    estado: fila.querySelector("select").value
  })).filter(item => item.fecha);
}

function calcularDistribucionAgenda(cantidad) {
  const escala = cantidad === 4 ? 0.9 : 1;
  return {
    escala,
    izquierda: (1127 - 754 * escala) / 2,
    inicio: cantidad === 4 ? 580 : 612,
    paso: 251 * escala + (cantidad === 4 ? 35 : 65)
  };
}

function dividirFechasAgenda(fechas) {
  const paginas = [];
  for (let indice = 0; indice < fechas.length; indice += 4) {
    paginas.push(fechas.slice(indice, indice + 4));
  }
  return paginas.length ? paginas : [[]];
}

function configurarAgenda(fechas = obtenerFechasAgenda(), maquina = piezas.agenda.maquina.value) {
  ocultarCapasTexto();
  fondoImg.hidden = true;
  baseImg.hidden = true;
  maquinaImg.hidden = true;
  agendaArte.hidden = false;
  document.getElementById("agendaAviso").hidden = true;
  document.getElementById("agendaNombre").textContent = maquina === "vela" ? "VELASLIM" : "DEPILACI\u00d3N DEFINITIVA";
  document.getElementById("agendaMaquinaImagen").src = `img/caratula/maquina/${maquina}.png`;
  const boxes = {
    "": "box.png",
    nueva: "box-nueva.png",
    agotado: "box-agotado.png"
  };
  const distribucion = calcularDistribucionAgenda(fechas.length);
  const contenedor = document.getElementById("agendaBloques");
  contenedor.replaceChildren();
  fechas.forEach((item, indice) => {
    const bloque = document.getElementById("agendaBloquePlantilla").content.firstElementChild.cloneNode(true);
    bloque.style.top = `${distribucion.inicio + indice * distribucion.paso}px`;
    bloque.style.left = `${distribucion.izquierda}px`;
    bloque.style.transform = `scale(${distribucion.escala})`;
    bloque.querySelector(".agenda-box").src = `img/caratula/${boxes[item.estado] || boxes[""]}`;
    bloque.querySelector(".agenda-marca img").src = `img/caratula/logo/${maquina}.png`;
    const fecha = new Date(`${item.fecha}T12:00:00`);
    bloque.querySelector(".agenda-dia").textContent = `${fecha.toLocaleDateString("es-AR", { weekday: "long" }).toUpperCase()} ${fecha.getDate()}`;
    bloque.querySelector(".agenda-mes").textContent = fecha.toLocaleDateString("es-AR", { month: "long" }).toUpperCase();
    contenedor.appendChild(bloque);
  });
  return Array.from(agendaArte.querySelectorAll("img"));
}

async function ajustarAvisoAgenda(cantidad) {
  const aviso = document.getElementById("agendaAviso");
  if (!cantidad) return;
  const distribucion = calcularDistribucionAgenda(cantidad);
  const finalBoxes = distribucion.inicio + (cantidad - 1) * distribucion.paso + 251 * distribucion.escala;
  const inicio = finalBoxes + 32;
  const limite = 1620;
  aviso.hidden = false;
  await cargarFuentesExport();
  const altura = aviso.offsetHeight;
  aviso.hidden = inicio + altura > limite;
  if (!aviso.hidden) aviso.style.top = `${inicio + (limite - inicio - altura) / 2}px`;
}

async function generarAgenda(revision) {
  const pieza = piezas.agenda;
  const maquina = pieza.maquina.value;
  const paginas = dividirFechasAgenda(obtenerFechasAgenda());
  const canvases = [];
  for (const fechas of paginas) {
    if (revision !== revisiones.agenda) return;
    await Promise.all(configurarAgenda(fechas, maquina).map(cargarImagen));
    await cargarFuentesExport();
    await ajustarAvisoAgenda(fechas.length);
    canvases.push(await capturarImagen());
  }
  if (revision !== revisiones.agenda) return;
  pieza.canvases = canvases;
  pieza.canvas = canvases[0];
  pieza.preview.replaceChildren();
  canvases.forEach((canvas, indice) => {
    const tarjeta = document.createElement("figure");
    tarjeta.className = "agenda-pagina";
    const url = canvas.toDataURL("image/png");
    const img = document.createElement("img");
    img.src = url;
    img.alt = `Agenda, imagen ${indice + 1} de ${canvases.length}`;
    const pie = document.createElement("figcaption");
    const etiqueta = document.createElement("span");
    etiqueta.textContent = `Imagen ${indice + 1} de ${canvases.length}`;
    const descarga = document.createElement("a");
    descarga.className = "agenda-agregar";
    descarga.textContent = "Descargar PNG";
    descarga.href = url;
    descarga.download = `agenda_${maquina}_${indice + 1}.png`;
    pie.append(etiqueta, descarga);
    tarjeta.append(img, pie);
    pieza.preview.appendChild(tarjeta);
  });
  pieza.preview.hidden = false;
  pieza.empty.hidden = true;
  pieza.botones.hidden = true;
}

// Las secciones comparten el mismo lienzo: procesar una captura por vez.
let colaGeneracion = Promise.resolve();
const revisiones = {};
function actualizarVista(tipo) {
  const revision = revisiones[tipo] = (revisiones[tipo] || 0) + 1;
  resetearVistaPrevia(tipo);
  colaGeneracion = colaGeneracion.then(() => {
    if (revision !== revisiones[tipo]) return;
    return prepararVista(tipo, revision);
  }).catch(err => {
    console.error(err);
    alert("No se pudo generar la imagen. Verific\u00e1 la conexi\u00f3n, las fuentes y las rutas.");
  });
}

function prepararVista(tipo, revision) {
  const pieza = piezas[tipo];
  if (tipo === "agenda") {
    return generarAgenda(revision);
  }
  fondoImg.hidden = false;
  if (tipo === "gift") {
    const tieneTexto = pieza.premio.value.trim() || pieza.para.value.trim() || pieza.de.value.trim();

    if (!tieneTexto) {
      resetearVistaPrevia(tipo);
      return;
    }

    return Promise.all([
      ...configurarGiftCard().map(cargarImagen)
    ])
      .then(() => cargarFuentesExport())
      .then(() => ajustarGiftCard())
      .then(() => generarVistaPrevia(tipo))
      .catch(err => {
        console.error(err);
        alert("No se pudieron cargar las im\u00e1genes o la fuente de Adobe. Verific\u00e1 la conexi\u00f3n y las rutas.");
      });
  }

  const maquina = pieza.maquina.value;
  const fecha = pieza.fecha.value;

  if (!maquina || !fecha) {
    resetearVistaPrevia(tipo);
    return;
  }

  const imagenes = configurarExport(tipo, maquina, fecha);

  return Promise.all([
    ...imagenes.map(cargarImagen)
  ])
    .then(() => cargarFuentesExport())
    .then(() => generarVistaPrevia(tipo))
    .catch(err => {
      console.error(err);
      alert("No se pudieron cargar las im\u00e1genes o la fuente de Adobe. Verific\u00e1 la conexi\u00f3n y las rutas.");
    });
}

async function capturarImagen() {
  let marcoCaptura;
  exportDiv.style.visibility = "visible";
  try {
    return await html2canvas(exportDiv, {
      useCORS: true,
      backgroundColor: null,
      onclone: documento => {
        marcoCaptura = documento.defaultView.frameElement;
        return cargarFuentesExport(documento);
      }
    });
  } finally {
    exportDiv.style.visibility = "hidden";
    if (marcoCaptura) marcoCaptura.remove();
  }
}

function generarVistaPrevia(tipo) {
  const pieza = piezas[tipo];
  return capturarImagen().then(canvas => {
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
      : tipo === "agenda"
        ? `${pieza.maquina.value}_${pieza.fecha.value.replaceAll("-", "_") || "caratula"}_${pieza.estado.value || "fecha"}`
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
  if (tipo === "agenda") {
    pieza.maquina.addEventListener("change", () => actualizarVista(tipo));
    document.getElementById("agendaFechas").addEventListener("input", () => actualizarVista(tipo));
    return;
  }
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

let siguienteFechaAgenda = 2;
const agendaFechas = document.getElementById("agendaFechas");
const agendaAgregar = document.getElementById("agendaAgregar");
agendaAgregar.addEventListener("click", () => {
  const fila = agendaFechas.firstElementChild.cloneNode(true);
  const identificador = siguienteFechaAgenda++;
  fila.querySelectorAll("input, select").forEach(campo => {
    const idAnterior = campo.id;
    campo.id = `${idAnterior}${identificador}`;
    campo.value = "";
    fila.querySelector(`label[for="${idAnterior}"]`).htmlFor = campo.id;
  });
  agendaFechas.appendChild(fila);
  actualizarNumeracionAgenda();
  fila.querySelector("input").focus({ preventScroll: true });
});

agendaFechas.addEventListener("click", event => {
  const quitar = event.target.closest(".agenda-quitar");
  if (!quitar) return;
  const fila = quitar.closest(".agenda-fila");
  if (agendaFechas.children.length === 1) {
    fila.querySelector("input").value = "";
    fila.querySelector("select").value = "";
  } else {
    fila.remove();
  }
  actualizarNumeracionAgenda();
  actualizarVista("agenda");
});

function actualizarNumeracionAgenda() {
  Array.from(agendaFechas.children).forEach((fila, indice) => {
    fila.querySelector("legend").textContent = `Fecha ${indice + 1}`;
    fila.querySelector(".agenda-quitar").setAttribute("aria-label", `Quitar fecha ${indice + 1}`);
  });
}

actualizarVista("agenda");
