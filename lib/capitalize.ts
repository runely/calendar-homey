export const capitalize = (word: string): string => {
  const chars: string[] = [word[0].toUpperCase()];

  for (let i: number = 1; i < word.length; i++) {
    chars.push(word[i].toLowerCase());
  }

  return chars.join("");
};
