import { Routes, Route, useLocation } from 'react-router-dom'
import { useFetchUser } from './utils/hooks/useFetchUser'
import { useCounterConfig } from './utils/hooks/useFetchCounter'
import { AdminPage } from './pages/AdminPage'
import { AdminThreadPage } from './pages/AdminThreadPage'
import { UserContext } from './utils/contexts/UserContext'
import { RegisterPage } from './pages/RegisterPage'
import { Sidebar } from './components/Sidebar'
import { AdminApprovePage } from './pages/AdminApprovePage'
import { CookiesProvider, useCookies } from 'react-cookie'
import { socket, SocketContext } from './utils/contexts/SocketContext'
import { CounterPage } from './pages/CounterPage'
import { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import { SnackbarComponent } from './components/SnackbarComponent'
import { PrefsPage } from './pages/PrefsPage'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { ThreadsPage } from './pages/ThreadsPage'
import { createTheme, CssBaseline, darkScrollbar, PaletteMode, responsiveFontSizes, ThemeProvider, useMediaQuery } from '@mui/material'
import { blue, grey } from '@mui/material/colors'
import { ColorModeContext } from './utils/contexts/ColorModeContext'
import { StatsPage } from './pages/StatsPage'
import { CountersPage } from './pages/CountersPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { AboutPage } from './pages/AboutPage'
import { DefaultPage } from './pages/DefaultPage'
import { ThreadPage } from './pages/ThreadPage'
import { UuidPage } from './pages/UuidPage'
import { IndividualCountPage } from './pages/IndividualCountPage'
import data from '@emoji-mart/data/sets/14/twitter.json'
import { init } from 'emoji-mart'
import { custom_emojis } from './utils/custom_emojis'
import { RulesPage } from './pages/RulesPage'
import { PostFinderPage } from './pages/PostFinderPage'
import ReactGA from 'react-ga4'
import BlogPage from './pages/BlogPage'
import { AchievementsPage } from './pages/AchievementsPage'
import { AchievementPage } from './pages/AchievementPage'
import { ContestPage } from './pages/ContestPage'
import { TheRockPage } from './pages/TheRockPage'
import LrwoedPage from './lrwoed/LrwoedPage'
import { AdminSystemMessagePage } from './pages/AdminSystemMessagePage'
import { SeasonPage } from './pages/SeasonPage'
import { useFetchAllThreads } from './utils/hooks/useFetchAllThreads'
import { ThreadsContext } from './utils/contexts/ThreadsContext'
import { RPSPage } from './pages/RPSPage'
import { MentionsPage } from './pages/MentionsPage'
import { LCPage } from './pages/LCPage'
import { ShopPage } from './pages/ShopPage'
import { Loading } from './components/Loading'
import AdminAchievementPage from './pages/AdminAchievementPage'
import AdminNewItemPage from './pages/AdminNewItemPage'
import BlogsPage from './pages/BlogsPage'
import BlogCreatePage from './pages/BlogCreatePage'
import { ThreadProvider } from './utils/contexts/ThreadContext'
import { NumberShufflePage } from './pages/NumberShufflePage'
import ServersPage from './pages/ServersPage'
import './utils/styles/wavy.scss'

function App() {
  const {
    user,
    setUser,
    loading,
    loadedSiteVer,
    setLoadedSiteVer,
    counter,
    setCounter,
    items,
    setItems,
    miscSettings,
    setMiscSettings,
    challenges,
    setChallenges,
    totalCounters,
    setTotalCounters,
    unreadMessageCount,
    setUnreadMessageCount,
    preferences,
    setPreferences,
  } = useFetchUser()
  const { allThreads, allThreadsLoading, setAllThreads, setAllThreadsLoading } = useFetchAllThreads()
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const [mode, setMode] = useState<PaletteMode>(prefersDarkMode ? 'dark' : 'light')

  const GA_TR_ID = process.env.REACT_APP_GA_TR_ID || 'G-0000000000'
  ReactGA.initialize(GA_TR_ID)

  useEffect(() => {
    if (preferences && preferences.pref_nightMode != 'System') {
      setMode(preferences.pref_nightMode === 'On' ? 'dark' : 'light')
    } else {
      setMode(prefersDarkMode ? 'dark' : 'light')
    }
  }, [prefersDarkMode, preferences])

  const [snack, setSnack] = useState({
    message: '',
    color: '',
    open: false,
  })

  // Init emoji data
  init({ data: data, custom: custom_emojis })

  const getDesignTokens = (mode: PaletteMode) => ({
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: '#4d4d4d',
          },
          html: {
            ...darkScrollbar(
              mode === 'light'
                ? {
                    track: grey[200],
                    thumb: grey[400],
                    active: grey[400],
                  }
                : undefined,
            ),
            //scrollbarWidth for Firefox
            scrollbarWidth: 'thin',
          },
        },
      },
    },
    palette: {
      mode,
      primary: {
        ...blue,
        ...(mode === 'dark' && {
          light: grey[700],
        }),
      },
      ...(mode === 'light' && {
        background: {},
      }),
      text: {
        ...(mode === 'light'
          ? {
              primary: grey[900],
              secondary: grey[800],
            }
          : {
              primary: grey[100],
              secondary: grey[500],
            }),
      },
      replyGold: {
        light: preferences && preferences.pref_night_mode_colors === 'Dark' ? '#727200' : '#f2ee0e',
        dark: preferences && preferences.pref_night_mode_colors === 'Light' ? '#f2ee0e' : '#727200',
      },
      reply0: {
        light: preferences && preferences.pref_night_mode_colors === 'Dark' ? '#4d0000' : '#ef7070',
        dark: preferences && preferences.pref_night_mode_colors === 'Light' ? '#ef7070' : '#4d0000',
      },
      reply100: {
        light: preferences && preferences.pref_night_mode_colors === 'Dark' ? '#980000' : '#ffaeae',
        dark: preferences && preferences.pref_night_mode_colors === 'Light' ? '#ffaeae' : '#980000',
      },
      reply200: {
        light: preferences && preferences.pref_night_mode_colors === 'Dark' ? '#654700' : '#ffebba',
        dark: preferences && preferences.pref_night_mode_colors === 'Light' ? '#ffebba' : '#654700',
      },
      reply300: {
        light: preferences && preferences.pref_night_mode_colors === 'Dark' ? '#216e00' : '#cfffba',
        dark: preferences && preferences.pref_night_mode_colors === 'Light' ? '#cfffba' : '#216e00',
      },
      reply400: {
        light: preferences && preferences.pref_night_mode_colors === 'Dark' ? '#003b0b' : '#a2e8af',
        dark: preferences && preferences.pref_night_mode_colors === 'Light' ? '#a2e8af' : '#003b0b',
      },
      reply500: {
        light: preferences && preferences.pref_night_mode_colors === 'Dark' ? '#006b53' : '#adffed',
        dark: preferences && preferences.pref_night_mode_colors === 'Light' ? '#adffed' : '#006b53',
      },
      reply600: {
        light: preferences && preferences.pref_night_mode_colors === 'Dark' ? '#004183' : '#add6ff',
        dark: preferences && preferences.pref_night_mode_colors === 'Light' ? '#add6ff' : '#004183',
      },
      reply700: {
        light: preferences && preferences.pref_night_mode_colors === 'Dark' ? '#14006c' : '#bcadff',
        dark: preferences && preferences.pref_night_mode_colors === 'Light' ? '#bcadff' : '#14006c',
      },
      reply800: {
        light: preferences && preferences.pref_night_mode_colors === 'Dark' ? '#460060' : '#e9adff',
        dark: preferences && preferences.pref_night_mode_colors === 'Light' ? '#e9adff' : '#460060',
      },
      reply900: {
        light: preferences && preferences.pref_night_mode_colors === 'Dark' ? '#6e0064' : '#ffadf8',
        dark: preferences && preferences.pref_night_mode_colors === 'Light' ? '#ffadf8' : '#6e0064',
      },
      reply1000: {
        light: preferences && preferences.pref_night_mode_colors === 'Dark' ? '#2a2a2a' : '#ededed',
        dark: preferences && preferences.pref_night_mode_colors === 'Light' ? '#ededed' : '#2a2a2a',
      },
    },
  })

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode: PaletteMode) => (prevMode === 'light' ? 'dark' : 'light'))
      },
    }),
    [],
  )
  var theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode, user])
  theme = responsiveFontSizes(theme)

  let location = useLocation()
  useEffect(() => {
    ReactGA.send({ hitType: 'pageview', page: location.pathname })
  }, [location])

  useEffect(() => {
    ReactGA.initialize(GA_TR_ID)
  }, [])

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <ColorModeContext.Provider value={colorMode}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <UserContext.Provider
              value={{
                user,
                setUser,
                loading,
                loadedSiteVer,
                setLoadedSiteVer,
                counter,
                setCounter,
                items,
                setItems,
                miscSettings,
                setMiscSettings,
                challenges,
                setChallenges,
                totalCounters,
                setTotalCounters,
                unreadMessageCount,
                setUnreadMessageCount,
                preferences,
                setPreferences,
              }}
            >
              <CookiesProvider>
                <SocketContext.Provider value={socket}>
                  <ThreadsContext.Provider value={{ allThreads, allThreadsLoading, setAllThreads, setAllThreadsLoading }}>
                    <ThreadProvider>
                      <Routes>
                        <Route path="/*" element={<Sidebar />} />
                      </Routes>
                      {user && counter && !loading && (
                        <Routes>
                          <Route path="/*" element={<SnackbarComponent></SnackbarComponent>} />
                        </Routes>
                      )}
                      <Routes>
                        <Route path="*" element={<div>Page Not Found</div>} />
                        {counter && counter.roles.includes('admin') && <Route path="/admin" element={<AdminPage />} />}
                        {counter && counter.roles.includes('admin') && <Route path="/admin/threads" element={<AdminThreadPage />} />}
                        {counter && counter.roles.includes('admin') && <Route path="/admin/approve" element={<AdminApprovePage />} />}
                        {counter && counter.roles.includes('admin') && (
                          <Route path="/admin/achievements" element={<AdminAchievementPage />} />
                        )}
                        {counter && counter.roles.includes('admin') && <Route path="/admin/new_item" element={<AdminNewItemPage />} />}
                        {counter && counter.roles.includes('admin') && (
                          <Route path="/admin/system_message" element={<AdminSystemMessagePage />} />
                        )}
                        {counter && counter.roles.includes('discord_verified') && (
                          <Route path="/register" element={<RegisterPage />} />
                        )}
                        <Route path="/" element={<DefaultPage />} />
                        <Route path="/counter/:counterId" element={<CounterPage />} />
                        <Route path="/blog/:blog" element={<BlogPage />} />
                        <Route path="/stats" element={<StatsPage />} />
                        <Route path="/threads" element={<ThreadsPage />} />
                        <Route path="/thread/:thread_name">
                          <Route index={true} element={<ThreadPage />} />
                          <Route path="/thread/:thread_name/:count_uuid" element={<IndividualCountPage />} />
                        </Route>
                        <Route path="/counters" element={<CountersPage />} />
                        <Route path="/uuid" element={<UuidPage />} />
                        <Route path="/post-finder" element={<PostFinderPage />} />
                        <Route path="/achievements">
                          <Route index={true} element={<AchievementsPage />} />
                          <Route path="/achievements/:achievementId" element={<AchievementPage />} />
                        </Route>
                        <Route path="/contest-rules" element={<ContestPage />} />
                        <Route path="/rules" element={<RulesPage />} />
                        <Route path="/privacy-policy" element={<PrivacyPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact-us" element={<AboutPage />} />
                        <Route path="/huh" element={<TheRockPage />} />
                        <Route path="/rps" element={<RPSPage />} />
                        <Route path="/shuffle" element={<NumberShufflePage />} />
                        <Route path="/r/livecounting" element={<LCPage />} />
                        <Route path="/lrwoed" element={<LrwoedPage />} />
                        <Route path="/rewards" element={<SeasonPage />} />
                        <Route path="/blogs" element={<BlogsPage />} />
                        <Route path="/blog/create" element={<BlogCreatePage />} />
                        <Route path="/blog/:blogId" element={<BlogPage />} />
                        <Route path="/servers" element={<ServersPage />} />
                        {user && counter && <Route path="/prefs" element={<PrefsPage />} />}
                        {user && counter && <Route path="/mentions" element={<MentionsPage />} />}
                        {user && counter && <Route path="/shop" element={<ShopPage />} />}
                      </Routes>
                    </ThreadProvider>
                  </ThreadsContext.Provider>
                </SocketContext.Provider>
              </CookiesProvider>
            </UserContext.Provider>
          </ThemeProvider>
        </ColorModeContext.Provider>
      </LocalizationProvider>
    </>
  )
}
export default App
