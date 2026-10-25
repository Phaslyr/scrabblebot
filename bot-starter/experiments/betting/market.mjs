export function marketKey(letter,progress,cash){return `${letter}:${progress<0.3?0:progress<0.75?1:2}:${cash<25?0:cash<65?1:2}`;}
export function marketPrice(table,letter,progress,cash){return table.cells[marketKey(letter,progress,cash)]??table.letters[letter]??table.fallback;}
