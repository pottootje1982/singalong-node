import React, { useState, createContext, useEffect } from 'react'
import { MuiThemeProvider } from '@material-ui/core'
import { createMuiTheme } from '@material-ui/core/styles'

const ThemeContext = createContext()
export default ThemeContext

const defaultTheme = createMuiTheme({
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
      createMuiTheme({
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
