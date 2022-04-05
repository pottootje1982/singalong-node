import React, { useState, createContext, useEffect } from 'react'
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles'

const ThemeContext = createContext()
export default ThemeContext

const defaultTheme = createTheme({
  palette: {
    type: 'light',
  },
})

export const ThemeProvider = (props) => {
  // State to hold the selected theme name
  const [theme, setTheme] = useState(defaultTheme)
  const storedTheme = window.localStorage.getItem('dark-or-light')
  const [themeName, setThemeName] = useState(
    storedTheme === 'null' ? 'light' : storedTheme
  )

  useEffect(() => {
    window.localStorage.setItem('dark-or-light', themeName)
    setTheme(
      createTheme({
        palette: {
          type: themeName || 'light',
        },
      })
    )
  }, [themeName])

  return (
    <ThemeContext.Provider value={{ setThemeName }}>
      <MuiThemeProvider theme={theme}>{props.children}</MuiThemeProvider>
    </ThemeContext.Provider>
  )
}
