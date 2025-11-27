/**
 * Converte horas para minutos
 * @param {number} horas - Número de horas
 * @returns {number} Minutos
 */
export function horasParaMinutos(horas) {
  return Math.round(horas * 60)
}

/**
 * Converte minutos para horas
 * @param {number} minutos - Número de minutos
 * @returns {number} Horas (com decimais)
 */
export function minutosParaHoras(minutos) {
  if (!minutos) return 0
  return minutos / 60
}

/**
 * Formata minutos para formato legível (dias, horas, minutos)
 * @param {number} minutos - Número de minutos
 * @returns {string} String formatada (ex: "2d 3h 30min" ou "1h 30min" ou "30min")
 */
export function formatarTempo(minutos) {
  if (!minutos && minutos !== 0) return 'Não informado'
  if (minutos === 0) return '0min'
  
  const dias = Math.floor(minutos / (60 * 24))
  const horas = Math.floor((minutos % (60 * 24)) / 60)
  const mins = minutos % 60
  
  const parts = []
  if (dias > 0) parts.push(`${dias}d`)
  if (horas > 0) parts.push(`${horas}h`)
  if (mins > 0) parts.push(`${mins}min`)
  
  return parts.join(' ') || '0min'
}

/**
 * Formata minutos para formato curto (apenas horas e minutos)
 * @param {number} minutos - Número de minutos
 * @returns {string} String formatada (ex: "2h 30min")
 */
export function formatarTempoCurto(minutos) {
  if (!minutos && minutos !== 0) return 'Não informado'
  if (minutos === 0) return '0min'
  
  const horas = Math.floor(minutos / 60)
  const mins = minutos % 60
  
  if (horas > 0 && mins > 0) {
    return `${horas}h ${mins}min`
  } else if (horas > 0) {
    return `${horas}h`
  } else {
    return `${mins}min`
  }
}

/**
 * Converte formato HH:MM para minutos
 * @param {string} timeString - String no formato "HH:MM" ou "H:MM"
 * @returns {number|null} Minutos ou null se inválido
 */
export function timeStringToMinutes(timeString) {
  if (!timeString || timeString.trim() === '') return null
  
  // Aceita formatos: "2:30", "02:30", "12:45"
  const parts = timeString.trim().split(':')
  if (parts.length !== 2) return null
  
  const hours = parseInt(parts[0])
  const minutes = parseInt(parts[1])
  
  if (isNaN(hours) || isNaN(minutes)) return null
  if (hours < 0 || minutes < 0 || minutes >= 60) return null
  
  return hours * 60 + minutes
}

/**
 * Converte minutos para formato HH:MM
 * @param {number} minutos - Número de minutos
 * @returns {string} String no formato "HH:MM"
 */
export function minutesToTimeString(minutos) {
  if (!minutos && minutos !== 0) return ''
  if (minutos === 0) return '00:00'
  
  const hours = Math.floor(minutos / 60)
  const mins = minutos % 60
  
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

/**
 * Valida formato de tempo HH:MM (aceita formato do input type="time")
 * @param {string} value - Valor a validar (formato "HH:MM")
 * @returns {{valid: boolean, error?: string}} Resultado da validação
 */
export function validateTempoResolucao(value) {
  if (value === '' || value === null || value === undefined) {
    return { valid: true } // Opcional, pode ser vazio
  }
  
  // Valida formato HH:MM (input type="time" já valida, mas verificamos aqui também)
  const timeRegex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/
  if (!timeRegex.test(value)) {
    return { valid: false, error: 'Formato inválido. Use HH:MM (ex: 02:30 para 2h30min)' }
  }
  
  const minutes = timeStringToMinutes(value)
  if (minutes === null) {
    return { valid: false, error: 'Formato inválido. Use HH:MM (ex: 02:30 para 2h30min)' }
  }
  
  return { valid: true }
}

/**
 * Converte datetime-local input para formato da API (ISO 8601)
 * @param {string} datetimeLocal - Valor do input datetime-local (formato "YYYY-MM-DDTHH:mm")
 * @returns {string|null} String no formato "YYYY-MM-DDTHH:mm:ss" ou null
 */
export function converterDatetimeLocalParaAPI(datetimeLocal) {
  if (!datetimeLocal || datetimeLocal.trim() === '') return null
  // datetime-local retorna no formato: "2025-11-20T14:30"
  // API espera: "2025-11-20T14:30:00"
  return datetimeLocal + ':00'
}

/**
 * Converte data da API para formato datetime-local
 * @param {string} dateString - Data no formato ISO 8601
 * @returns {string} String no formato "YYYY-MM-DDTHH:mm" para input datetime-local
 */
export function converterAPIParaDatetimeLocal(dateString) {
  if (!dateString) return ''
  // API retorna: "2025-11-20T14:30:00.000000Z"
  // datetime-local precisa: "2025-11-20T14:30"
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * Formata data/hora para exibição
 * @param {string} dateString - Data no formato ISO 8601
 * @returns {string} String formatada (ex: "20/11/2025 14:30")
 */
export function formatarDataHora(dateString) {
  if (!dateString) return 'Não informado'
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Data inválida'
  
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Valida data/hora de resolução
 * @param {string} value - Valor a validar (formato datetime-local)
 * @param {string} created_at - Data de criação do ticket
 * @returns {{valid: boolean, error?: string}} Resultado da validação
 */
export function validateResolvidoEm(value, created_at) {
  if (value === '' || value === null || value === undefined) {
    return { valid: true } // Opcional, pode ser vazio
  }
  
  const resolvido = new Date(value)
  if (isNaN(resolvido.getTime())) {
    return { valid: false, error: 'Data inválida' }
  }
  
  if (created_at) {
    const criado = new Date(created_at)
    if (resolvido < criado) {
      return { valid: false, error: 'Data de resolução não pode ser anterior à data de criação' }
    }
  }
  
  return { valid: true }
}

