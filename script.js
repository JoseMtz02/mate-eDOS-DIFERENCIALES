async function resolverConWolfram(ecuacionStr) {
    try {
      const response = await fetch("http://localhost:3000/resolver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ecuacion: ecuacionStr }),
      });
  
      const data = await response.json();
      if (data.solucion) {
        return { solucion: data.solucion, datos: renderizarGrafica(data.solucion) };
      } else {
        return { solucion: "No se pudo resolver la ecuación.", datos: null };
      }
    } catch (error) {
      return { solucion: "Error al conectarse con el servidor: " + error.message, datos: null };
    }
  }
  
  function insertarSimbolo(simbolo) {
    const input = document.getElementById("ecuacion");
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;
    const newText = text.substring(0, start) + simbolo + text.substring(end);
    input.value = newText;
    input.focus();
    input.setSelectionRange(start + simbolo.length, start + simbolo.length);
    
    const ecuacionRenderizada = convertirALatex(input.value);
    document.getElementById("ecuacionRenderizada").innerHTML = ecuacionRenderizada;
    MathJax.typesetPromise();
  }
  
  function convertirALatex(ecuacionStr) {
    ecuacionStr = ecuacionStr
        .replace(/cos\(/g, '\\cos(')
        .replace(/sin\(/g, '\\sin(')
        .replace(/tan\(/g, '\\tan(')
        .replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}')
        .replace(/dy\/dx/g, '\\frac{dy}{dx}')
        .replace(/\^/g, '^')
        .replace(/\*/g, '\\cdot')
        .replace(/π/g, '\\pi');
  
    ecuacionStr = ecuacionStr.replace(/\(([^()]+)\)\/([^()]+)/g, '\\frac{$1}{$2}');
    ecuacionStr = ecuacionStr.replace(/([^()]+)\/([^()]+)/g, '\\frac{$1}{$2}');
  
    return `\\[ ${ecuacionStr} \\]`;
  }

  function renderizarGrafica(expresion) {
    const graficaContainer = document.getElementById("geogebra-container");
    graficaContainer.innerHTML = "";
  
    // Crear la instancia de GeoGebra
    const ggbApp = new GGBApplet({
      appName: "graphing",
      width: 600,
      height: 400,
      showToolBar: false,
      showAlgebraInput: false,
      showMenuBar: false,
      enableLabelDrags: false,
      enableShiftDragZoom: true,
      useBrowserForJS: false,
      language: "es"
    }, true);
  
    ggbApp.inject("geogebra-container");
  
    setTimeout(() => {
      const api = ggbApp.getAppletObject();
  
      if (!expresion || expresion.trim() === "") {
        console.error("No se pudo generar la gráfica.");
        return;
      }
  
      if (expresion.includes("=")) {
        if (/\bc_1\b/.test(expresion)) {
          
          let parts = expresion.split("c_1/");
          api.evalCommand("c_1 = 1");
      
          let expressionWithoutC = parts.join("");
          
          if (expressionWithoutC.startsWith("/")) {
            expressionWithoutC = "1" + expressionWithoutC;
          }

          console.log(expressionWithoutC)
          
          api.evalCommand(expressionWithoutC);
        } else {
          let expression = expresion;
          
          if (expression.startsWith("/")) {
            expression = "1" + expression;
          }
          
          api.evalCommand(expression);
        }
      } else {
        let expression = `f(x) = ${expresion}`;
        
        if (expression.startsWith("/")) {
          expression = "1" + expression;
        }
        
        api.evalCommand(expression);
      }           
      
    }, 1000);
  }  
  
  document.getElementById("ecuacionForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const ecuacionStr = document.getElementById("ecuacion").value;
  
    const ecuacionRenderizada = convertirALatex(ecuacionStr);
    document.getElementById("ecuacionRenderizada").innerHTML = ecuacionRenderizada;
    MathJax.typesetPromise([document.getElementById("ecuacionRenderizada")]);
  
    document.getElementById("solucion").innerHTML = "Resolviendo...";
  
    const { solucion, datos } = await resolverConWolfram(ecuacionStr);
  
    let solucionLatex;
    if (solucion.startsWith("No se pudo") || solucion.startsWith("Error")) {
      solucionLatex = `<p style="color: red;">${solucion}</p>`;
    } else {
      solucionLatex = `\\[ ${solucion} \\]`;
    }
  
    document.getElementById("solucion").innerHTML = solucionLatex;
    MathJax.typesetPromise([document.getElementById("solucion")]);
  
    if (datos) {
      renderizarGrafica(datos);
    }
  });
  
  document.getElementById("ecuacion").addEventListener("input", function () {
    const ecuacionStr = this.value;
    const ecuacionRenderizada = convertirALatex(ecuacionStr);
    document.getElementById("ecuacionRenderizada").innerHTML = ecuacionRenderizada;
    MathJax.typesetPromise([document.getElementById("ecuacionRenderizada")]);
  });  