// Utility to transform text to lowercase with asterisks
export const transformText = (text: string): string => {
  if (!text) return text
  
  // Convert to lowercase and add asterisk after each sentence
  return text.toLowerCase().replace(/([.!?])\s*/g, '$1* ')
}

// Transform specific UI text
export const transformUIText = (text: string): string => {
  return text.toLowerCase() + '*'
}