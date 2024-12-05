export const formatLatexEquation = (equation) => {
    // Remove square brackets and trim whitespace
    let formatted = equation;
    if (formatted.startsWith('\\[') && formatted.endsWith('\\]')) {
        formatted = formatted.slice(2, -2);
    }
    if (formatted.startsWith('\\(') && formatted.endsWith('\\)')) {
        formatted = formatted.slice(2, -2);
    }
    return formatted;
};