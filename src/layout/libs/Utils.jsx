// Librería de utilidades basada en https://stackoverflow.com/a/52619982
//const someCommonValues = ['common', 'values'];
//------------------------------------------------------------------------------
export const getOnlyNumbers = (st) => {
    // Dejar solo los números
    // Basado en https://www.geeksforgeeks.org/how-to-get-only-numeric-values-in-textinput-field-in-react-native/
    return st.replace(/[^0-9]/g, "");
};
//------------------------------------------------------------------------------
export const getOnlyLettersEs = (st) => {
    // Solo letras, acentos, eñes, diéresis y espacio
    // Regex obtenido de https://es.stackoverflow.com/a/81045
    // El espacio con "\s" fue una sugerencia de ChatGPT para otra cosa, también
    // podría haberse añadido un espacio literal " ".
    return st.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
};
//------------------------------------------------------------------------------
export const getSVGURI = ({ prefix, iconName, icon }, color) =>
    // Usar un ícono como fondo
    // Forma de uso:
    // Opción 1) <div style={{ backgroundImage: `url(${getSVGURI(faCaretDown)}, '#fff')` }}/>
    // Opción 2) sx={{ backgroundImage: `url(${getSVGURI(faCaretDown)})` }}
    // Obtenido de https://stackoverflow.com/a/68914822
    // Nota: si se usan parámetros o variables NO rodearlas con {}.

    `data:image/svg+xml;base64,${btoa(
            `<svg data-prefix="${prefix}" data-icon="${iconName}"
      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${icon[0]} ${icon[1]}">
      <path fill="${color || "currentColor"}" d="${icon[4]}"></path>
    </svg>`)}`
;