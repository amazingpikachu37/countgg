import { useContext, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { UserContext } from '../utils/contexts/UserContext'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Menu from '@mui/material/Menu'
import {
  Avatar,
  Badge,
  Button,
  CardMedia,
  Chip,
  Collapse,
  Divider,
  Drawer,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Modal,
  Skeleton,
  Step,
  StepLabel,
  Stepper,
  Theme,
  Tooltip,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import QueryStatsIcon from '@mui/icons-material/QueryStats'
import HomeIcon from '@mui/icons-material/Home'
import StadiumIcon from '@mui/icons-material/Stadium'
import PersonIcon from '@mui/icons-material/Person'
import GroupsIcon from '@mui/icons-material/Groups'
import LoginIcon from '@mui/icons-material/Login'
import CalculateIcon from '@mui/icons-material/Calculate'
import InfoIcon from '@mui/icons-material/Info'
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip'
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail'
import { logout } from '../utils/api'
import { ColorModeContext } from '../utils/contexts/ColorModeContext'
import { useIsMounted } from '../utils/hooks/useIsMounted'
import CggLogo from '../assets/cgg-128.png'
import GavelIcon from '@mui/icons-material/Gavel'
import SearchIcon from '@mui/icons-material/Search'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import { calculateLevel, loginRedirect, site_version } from '../utils/helpers'
import VerifiedIcon from '@mui/icons-material/Verified'
import ErrorIcon from '@mui/icons-material/Error'
import PendingIcon from '@mui/icons-material/Pending'
import { SocketContext } from '../utils/contexts/SocketContext'
import LinearProgress from '@mui/material/LinearProgress'
import { XPDisplay } from './XPDisplay'
import EmailIcon from '@mui/icons-material/Email'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import StarsIcon from '@mui/icons-material/Stars'
import TagIcon from '@mui/icons-material/Tag'
import { ThreadsContext } from '../utils/contexts/ThreadsContext'
import { useThread } from '../utils/contexts/ThreadContext'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import MailIcon from '@mui/icons-material/Mail'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'

export const Sidebar = () => {
  const navigate = useNavigate()
  const { hash } = useLocation()

  const { loading, loadedSiteVer, setLoadedSiteVer, counter, setCounter, user, unreadMessageCount } = useContext(UserContext)
  const socket = useContext(SocketContext)

  useEffect(() => {
    socket.on(`site_version`, function (data) {
      if (setLoadedSiteVer) {
        setLoadedSiteVer(data)
      }
    })

    return () => {
      socket.off(`site_version`)
    }
  }, [loading])

  const theme = useTheme()
  const colorMode = useContext(ColorModeContext)

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [threadPickerOpen, setThreadPickerOpen] = useState(false)

  const [modalOpen, setModalOpen] = useState<boolean>((counter && !counter.color && true) || false)
  const [registrationToggle, setRegistrationToggle] = useState(true)

  const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'))

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen)
  }

  const { allThreads, allThreadsLoading } = useContext(ThreadsContext)

  const handleThreadPickerToggle = () => {
    setThreadPickerOpen(!threadPickerOpen)
  }

  const logoutFunc = async () => {
    const res = await logout()
    if (res.status == 201) {
      window.location.reload()
    }
  }

  if (
    (hash.includes('registration') || (counter && !counter.color)) &&
    modalOpen == false &&
    registrationToggle &&
    !window.location.href.includes('register')
  ) {
    // setTimeout(function() {setModalOpen(true);}, 100);
    setModalOpen(true)
    setRegistrationToggle(false)
  }

  const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '75%',
    bgcolor: 'background.paper',
    color: 'text.primary',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    maxHeight: '75%',
    overflowY: 'scroll',
  }

  const [mobilePickerOpen, setMobilePickerOpen] = useState(false)
  const [desktopPickerOpen, setDesktopPickerOpen] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      if (user.pref_hide_thread_picker) {
        setDesktopPickerOpen(false)
      }
    }
  }, [loading])

  const handleMobileDrawerToggle = () => {
    setMobilePickerOpen(!mobilePickerOpen)
  }
  const handleDesktopDrawerToggle = () => {
    setDesktopPickerOpen(!desktopPickerOpen)
  }

  function groupThreadsByCategory(threads) {
    const groupedThreads = {}

    threads.forEach((thread) => {
      const category = thread.category || 'Uncategorized' // If category is undefined or blank, consider it as "Uncategorized"

      if (!groupedThreads[category]) {
        groupedThreads[category] = []
      }

      groupedThreads[category].push(thread)
    })

    return groupedThreads
  }

  const specificOrder = ['Traditional', 'Double Counting', 'No Mistakes', 'Miscellaneous']
  const customSort = (a, b) => {
    if (specificOrder.includes(a) && specificOrder.includes(b)) {
      return specificOrder.indexOf(a) - specificOrder.indexOf(b)
    } else if (specificOrder.includes(a)) {
      return -1
    } else if (specificOrder.includes(b)) {
      return 1
    }

    return a.localeCompare(b) // Keep the rest in alphabetical order
  }

  const initialExpandedCategories = Object.keys(groupThreadsByCategory(allThreads)).sort(customSort)
  const [expandedCategories, setExpandedCategories] = useState(initialExpandedCategories)

  useEffect(() => {
    setExpandedCategories(Object.keys(groupThreadsByCategory(allThreads)).sort(customSort))
  }, [allThreads])

  const handleCategoryClick = (category) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter((cat) => cat !== category))
    } else {
      setExpandedCategories([...expandedCategories, category])
    }
  }

  const { threadName, fullThread } = useThread()

  useEffect(() => {
    function navigateThread(direction) {
      console.log('Navigating thread', direction)
      const groupedThreads = groupThreadsByCategory(allThreads)
      const currentCategory = allThreads.find((thread) => thread.name === threadName)?.category || 'Uncategorized'
      console.log('Current category:', currentCategory)
      if (!currentCategory || !groupedThreads[currentCategory]) {
        return
      }

      const threadsInCategory = groupedThreads[currentCategory]
      const currentIndex = threadsInCategory.findIndex((thread) => thread.name === threadName)

      if (currentIndex === -1) {
        return
      }

      let newIndex
      if (direction === 'up') {
        newIndex = currentIndex - 1
      } else if (direction === 'down') {
        newIndex = currentIndex + 1
      }

      if (newIndex >= 0 && newIndex < threadsInCategory.length) {
        const newThread = threadsInCategory[newIndex]
        navigate(`/thread/${newThread.name}`)
      } else {
        const categoryIndex = specificOrder.indexOf(currentCategory)
        if (direction === 'up' && categoryIndex > 0) {
          const previousCategory = specificOrder[categoryIndex - 1]
          const previousThreads = groupedThreads[previousCategory]
          if (previousThreads.length > 0) {
            const lastThreadInPreviousCategory = previousThreads[previousThreads.length - 1]
            navigate(`/thread/${lastThreadInPreviousCategory.name}`)
          }
        } else if (direction === 'down' && categoryIndex < specificOrder.length - 1) {
          const nextCategory = specificOrder[categoryIndex + 1]
          const nextThreads = groupedThreads[nextCategory]
          if (nextThreads.length > 0) {
            const firstThreadInNextCategory = nextThreads[0]
            navigate(`/thread/${firstThreadInNextCategory.name}`)
          }
        }
      }
    }

    const handleKeyDown = (event) => {
      if (event.altKey) {
        switch (event.key) {
          case 'ArrowUp':
            navigateThread('up')
            break
          case 'ArrowDown':
            navigateThread('down')
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      // Remove the event listener when the component unmounts
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [threadName, allThreadsLoading]) // Empty dependency array to run this effect only once

  const threadPickerMemo = useMemo(() => {
    const groupedThreads = groupThreadsByCategory(allThreads)

    if (allThreads && allThreads.length > 0) {
      const picker = (
        <Box
          sx={{
            minHeight: 500,
            height: {
              xs: '100vh',
              // lg: 'calc(100vh - 65px)'
            },
            width: 'min-content',
            bgcolor: 'background.paper',
            color: 'text.primary',
            flexDirection: 'column',
            overflowY: 'scroll',
          }}
        >
          {Object.keys(groupedThreads)
            .sort(customSort)
            .map((category) => (
              <div key={category}>
                <ListItemButton
                  onClick={() => handleCategoryClick(category)}
                  sx={{
                    py: 0,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 24, paddingRight: 1 }}>
                    {expandedCategories.includes(category) ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
                  </ListItemIcon>
                  <ListItemText primary={category} />
                </ListItemButton>
                <Collapse in={expandedCategories.includes(category)}>
                  <List>
                    {groupedThreads[category].map((thread, index) => (
                      <Button
                        key={thread.id}
                        startIcon={<TagIcon />}
                        sx={{
                          width: '100%',
                          py: isDesktop ? 0 : 0.5,
                          opacity: threadName === thread.name ? 1 : 0.75,
                          textAlign: 'left',
                          border: '1px solid transparent',
                          '&:hover': {
                            opacity: 1,
                            border: '1px solid',
                            borderColor: theme.palette.primary.main,
                          },
                          bgcolor: threadName === thread.name ? alpha(theme.palette.primary.main, 0.5) : 'background.paper',
                          color: threadName === thread.name ? 'text.primary' : 'text.secondary',
                          justifyContent: 'flex-start',
                        }}
                        onClick={() => navigate(`/thread/${thread.name}`)}
                      >
                        {thread.threadOfTheDay && <LocalFireDepartmentIcon sx={{ color: 'orangered', verticalAlign: 'bottom' }} />}
                        {thread.title}
                      </Button>
                    ))}
                  </List>
                </Collapse>
              </div>
            ))}
        </Box>
      )
      return !isDesktop ? (
        <Drawer
          variant="temporary"
          open={mobilePickerOpen}
          anchor="left"
          onClose={handleMobileDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            boxSizing: 'border-box',
          }}
        >
          {picker}
        </Drawer>
      ) : (
        // <Drawer
        //   variant="persistent"
        //   sx={{
        //     display: { xs: 'none', lg: 'block' },
        //     '& .MuiDrawer-paper': { boxSizing: 'border-box', display: "contents" },
        //   }}
        //   open={desktopPickerOpen}
        // >
        <Drawer
          anchor="left"
          open={desktopPickerOpen}
          onClose={handleDesktopDrawerToggle}
          variant="temporary"
          sx={{
            display: 'block',
            boxSizing: 'border-box',
            width: 'min-content',
            // position: 'relative!important',
          }}
          ModalProps={{
            keepMounted: true,
          }}
        >
          {picker}
        </Drawer>
      )
    } else {
      // console.log("No threads");
      return <Box sx={{ display: 'none' }}></Box>
    }
  }, [allThreadsLoading, mobilePickerOpen, desktopPickerOpen, threadName, expandedCategories, isDesktop])

  const drawer = (
    <div>
      {/* <Toolbar /> */}
      <Typography variant="body2" sx={{ m: 2, display: 'flex', alignItems: 'end' }}>
        counting.gg {site_version}&nbsp;
        {loadedSiteVer ? (
          site_version === loadedSiteVer ? (
            <Tooltip title="Up to date">
              <VerifiedIcon color="success" />
            </Tooltip>
          ) : (
            <Tooltip placement="right" title="Not up to date. Try to refresh, or clear your cache.">
              <ErrorIcon color="error" />
            </Tooltip>
          )
        ) : (
          <PendingIcon color="disabled" />
        )}
      </Typography>
      <Divider />
      <List>
        <Link
          color={'inherit'}
          underline="none"
          href={`/`}
          onClick={(e) => {
            e.preventDefault()
            navigate(`/`)
          }}
        >
          <ListItem onClick={handleDrawerToggle} key={'home'} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <HomeIcon></HomeIcon>
              </ListItemIcon>
              <ListItemText primary={'Home'} />
            </ListItemButton>
          </ListItem>
        </Link>
        <Link
          color={'inherit'}
          underline="none"
          href={`/threads`}
          onClick={(e) => {
            e.preventDefault()
            navigate(`/threads`)
          }}
        >
          <ListItem onClick={handleDrawerToggle} key={'threads'} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <StadiumIcon></StadiumIcon>
              </ListItemIcon>
              <ListItemText primary={'Threads'} />
            </ListItemButton>
          </ListItem>
        </Link>
        <Link
          color={'inherit'}
          underline="none"
          href={`/mentions`}
          onClick={(e) => {
            e.preventDefault()
            navigate(`/mentions`)
          }}
        >
          <ListItem onClick={handleDrawerToggle} key={'mentions'} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <MailIcon />
              </ListItemIcon>
              <Badge color="error" badgeContent={unreadMessageCount}>
                <ListItemText primary={'Mentions'} />
              </Badge>
            </ListItemButton>
          </ListItem>
        </Link>
        <Link
          color={'inherit'}
          underline="none"
          href={`/rules`}
          onClick={(e) => {
            e.preventDefault()
            navigate(`/rules`)
          }}
        >
          <ListItem onClick={handleDrawerToggle} key={'rules'} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <GavelIcon></GavelIcon>
              </ListItemIcon>
              <ListItemText primary={'Rules'} />
            </ListItemButton>
          </ListItem>
        </Link>
      </List>
      <Divider />
      <List>
        <Link
          color={'inherit'}
          underline="none"
          href={`/stats`}
          onClick={(e) => {
            e.preventDefault()
            navigate(`/stats`)
          }}
        >
          <ListItem onClick={handleDrawerToggle} key={'stats'} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <QueryStatsIcon></QueryStatsIcon>
              </ListItemIcon>
              <ListItemText primary={'Stats'} />
            </ListItemButton>
          </ListItem>
        </Link>
        {counter && counter.roles.includes('counter') && (
          <Link
            color={'inherit'}
            underline="none"
            href={`/counter/${counter.username}`}
            onClick={(e) => {
              e.preventDefault()
              navigate(`/counter/${counter.username}`)
            }}
          >
            <ListItem onClick={handleDrawerToggle} key={'my_profile'} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <PersonIcon></PersonIcon>
                </ListItemIcon>
                <ListItemText primary={'My Profile'} />
              </ListItemButton>
            </ListItem>
          </Link>
        )}
        <Link
          color={'inherit'}
          underline="none"
          href={`/counters`}
          onClick={(e) => {
            e.preventDefault()
            navigate(`/counters`)
          }}
        >
          <ListItem onClick={handleDrawerToggle} key={'counters'} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <GroupsIcon></GroupsIcon>
              </ListItemIcon>
              <ListItemText primary={'Counters'} />
            </ListItemButton>
          </ListItem>
        </Link>
        <Link
          color={'inherit'}
          underline="none"
          href={`/achievements`}
          onClick={(e) => {
            e.preventDefault()
            navigate(`/achievements`)
          }}
        >
          <ListItem onClick={handleDrawerToggle} key={'achievements'} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <EmojiEventsIcon></EmojiEventsIcon>
              </ListItemIcon>
              <ListItemText primary={'Achievements'} />
            </ListItemButton>
          </ListItem>
        </Link>
        <Link
          color={'inherit'}
          underline="none"
          href={`/uuid`}
          onClick={(e) => {
            e.preventDefault()
            navigate(`/uuid`)
          }}
        >
          <ListItem onClick={handleDrawerToggle} key={'uuid'} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <CalculateIcon></CalculateIcon>
              </ListItemIcon>
              <ListItemText primary={'UUID to Time'} />
            </ListItemButton>
          </ListItem>
        </Link>
        <Link
          color={'inherit'}
          underline="none"
          href={`/post-finder`}
          onClick={(e) => {
            e.preventDefault()
            navigate(`/post-finder`)
          }}
        >
          <ListItem onClick={handleDrawerToggle} key={'post-finder'} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <SearchIcon></SearchIcon>
              </ListItemIcon>
              <ListItemText primary={'Post Finder'} />
            </ListItemButton>
          </ListItem>
        </Link>
        {counter && counter.roles.includes('counter') && (
          <Link
            color={'inherit'}
            underline="none"
            href={`/rewards`}
            onClick={(e) => {
              e.preventDefault()
              navigate(`/rewards`)
            }}
          >
            <ListItem onClick={handleDrawerToggle} key={'rewards'} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <StarsIcon />
                </ListItemIcon>
                <ListItemText primary={'Rewards'} />
              </ListItemButton>
            </ListItem>
          </Link>
        )}
        {counter && counter.roles.includes('counter') && (
          <Link
            color={'inherit'}
            underline="none"
            href={`/shop`}
            onClick={(e) => {
              e.preventDefault()
              navigate(`/shop`)
            }}
          >
            <ListItem onClick={handleDrawerToggle} key={'shop'} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <ShoppingCartIcon />
                </ListItemIcon>
                <ListItemText primary={'Shop'} />
              </ListItemButton>
            </ListItem>
          </Link>
        )}
      </List>
      <Divider />
      {counter && counter.roles.includes('admin') && (
        <>
          <List>
            <Link
              color={'inherit'}
              underline="none"
              href={`/admin`}
              onClick={(e) => {
                e.preventDefault()
                navigate(`/admin`)
              }}
            >
              <ListItem onClick={handleDrawerToggle} key={'admin'} disablePadding>
                <ListItemButton onClick={() => navigate(`/admin`)}>
                  <ListItemIcon>
                    <PersonIcon></PersonIcon>
                  </ListItemIcon>
                  <ListItemText primary={'Admin'} />
                </ListItemButton>
              </ListItem>
            </Link>
          </List>
          <Divider />
        </>
      )}
      <List>
        <Link
          color={'inherit'}
          underline="none"
          href={`/about`}
          onClick={(e) => {
            e.preventDefault()
            navigate(`/about`)
          }}
        >
          <ListItem onClick={handleDrawerToggle} key={'about'} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <InfoIcon></InfoIcon>
              </ListItemIcon>
              <ListItemText primary={'About'} />
            </ListItemButton>
          </ListItem>
        </Link>
        <Link
          color={'inherit'}
          underline="none"
          href={`/privacy-policy`}
          onClick={(e) => {
            e.preventDefault()
            navigate(`/privacy-policy`)
          }}
        >
          <ListItem onClick={handleDrawerToggle} key={'privacy-policy'} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <PrivacyTipIcon></PrivacyTipIcon>
              </ListItemIcon>
              <ListItemText primary={'Privacy Policy'} />
            </ListItemButton>
          </ListItem>
        </Link>
        <Link
          color={'inherit'}
          underline="none"
          href={`/contact-us`}
          onClick={(e) => {
            e.preventDefault()
            navigate(`/contact-us`)
          }}
        >
          <ListItem onClick={handleDrawerToggle} key={'contact-us'} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <AlternateEmailIcon></AlternateEmailIcon>
              </ListItemIcon>
              <ListItemText primary={'Contact'} />
            </ListItemButton>
          </ListItem>
        </Link>
      </List>
    </div>
  )

  return (
    <Box sx={{ flexGrow: 1, minHeight: 65, maxHeight: 65 }}>
      <AppBar
        position="static"
        color={'primary'}
        sx={{
          minHeight: 65,
          maxHeight: 65,
          // bgcolor: loadedSiteVer && site_version !== loadedSiteVer ? 'red' : '',
          // background: fullThread ? `linear-gradient(to right, ${fullThread.color1}, ${fullThread.color2})` : 'blue',
          background:
            loadedSiteVer && site_version !== loadedSiteVer
              ? 'red'
              : fullThread
                ? `linear-gradient(to right, ${fullThread.color1}, ${fullThread.color2})`
                : '',
          borderBottom: '1px solid',
          borderColor: 'rgba(194, 224, 255, 0.30)',
        }}
      >
        <Toolbar sx={{ minHeight: 65, maxHeight: 65 }}>
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={handleDrawerToggle}>
            <Badge color="error" badgeContent={unreadMessageCount}>
              <MenuIcon />
            </Badge>
          </IconButton>
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={handleDrawerToggle}
            variant="temporary"
            ModalProps={{
              keepMounted: true,
            }}
          >
            {drawer}
          </Drawer>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={isDesktop ? handleDesktopDrawerToggle : handleMobileDrawerToggle}
          >
            <TagIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ display: 'flex', justifyContent: 'center', flexGrow: 1 }}>
            <Link
              href={`/`}
              onClick={(e) => {
                e.preventDefault()
                navigate('/')
              }}
            >
              <CardMedia
                component="img"
                className={`cgg-logo`}
                sx={{ maxHeight: '48px', width: 'auto' }}
                image={CggLogo}
                alt={`logo`}
              />
            </Link>
          </Typography>
          {counter &&
            (counter.roles.includes('unverified') ||
              counter.roles.includes('manual_verification_needed') ||
              counter.roles.includes('discord_verified')) && (
              <>
                {counter && !counter.color && (
                  <Badge color="error" badgeContent="1">
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => {
                        setModalOpen(!modalOpen)
                      }}
                    >
                      Complete Registration
                    </Button>
                  </Badge>
                )}
                {counter && counter.color && (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => {
                      setModalOpen(!modalOpen)
                    }}
                  >
                    Edit Registration
                  </Button>
                )}
                <Modal
                  open={modalOpen}
                  onClose={() => {
                    setModalOpen(false)
                  }}
                  aria-labelledby="modal-modal-title"
                  aria-describedby="modal-modal-description"
                >
                  <Box sx={modalStyle}>
                    <Stepper
                      activeStep={
                        parseInt(
                          `${(counter.roles.includes('unverified') && 0) || (counter.roles.includes('manual_verification_needed') && 0) || (counter.roles.includes('discord_verified') && 1)}`,
                        ) || 0
                      }
                      alternativeLabel
                    >
                      <Step key={'Verify on Discord'}>
                        <StepLabel>{'Verify on Discord'}</StepLabel>
                      </Step>
                      <Step key={'Create Profile'}>
                        <StepLabel>{'Create Profile'}</StepLabel>
                      </Step>
                      <Step key={'Post First Count'}>
                        <StepLabel>{'Post First Count'}</StepLabel>
                      </Step>
                    </Stepper>
                    {counter.roles.includes('unverified') && (
                      <>
                        <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ mt: 2 }}>
                          Join the Discord to continue!
                        </Typography>
                        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                          Welcome to counting.gg, we hope you have a great time! You'll need to join our Discord server using the link
                          below to complete your profile registration.
                        </Typography>
                        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                          Follow the instructions in the server to connect your discord account, and refresh this page when you're
                          complete!
                        </Typography>
                        <Button variant="contained" target={'_blank'} href={'https://discord.gg/bfS9RQht6M'} sx={{ mt: 1 }}>
                          Join Discord
                        </Button>
                      </>
                    )}
                    {counter.roles.includes('manual_verification_needed') && !counter.color && (
                      <>
                        <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ mt: 2 }}>
                          Manual verification needed :(
                        </Typography>
                        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                          Unfortunately your account requires manual verification. If you're a new counter, please reach out to the
                          Discord moderators for help!
                        </Typography>
                        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                          This measure is taken to prevent users from joining with alternate accounts. Sorry! Please
                        </Typography>
                        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                          If you needed to make a new account or transfer over an old account, reach out, we can help!
                        </Typography>
                        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                          If you've left the Discord server, you can join again here:
                        </Typography>
                        <Button variant="contained" target={'_blank'} href={'https://discord.gg/bfS9RQht6M'} sx={{ mt: 1 }}>
                          Join Discord
                        </Button>
                      </>
                    )}
                    {counter.roles.includes('discord_verified') && !counter.color && (
                      <>
                        <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ mt: 2 }}>
                          Create your profile
                        </Typography>
                        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                          Your name may not contain derogatory or hateful language.
                        </Typography>
                        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                          Some users may need to be manually approved.
                        </Typography>
                        <Button
                          variant="contained"
                          onClick={() => {
                            navigate(`/register`)
                            setModalOpen(false)
                          }}
                          sx={{ mt: 1 }}
                        >
                          Continue
                        </Button>
                      </>
                    )}
                    {counter.roles.includes('discord_verified') &&
                      counter.roles.includes('manual_verification_needed') &&
                      counter.color && (
                        <>
                          <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ mt: 2 }}>
                            You're almost there!
                          </Typography>
                          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                            Your registration is under review. No further action is needed from you at this time.
                          </Typography>
                          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                            Moderators will review your profile submission and hopefully approve it soon. Should they find a need for
                            you to change your name, they will reach out on Discord!
                          </Typography>
                          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                            Your changes are not final. If you want to make any further changes to your profile, you may do so using
                            the link below:
                          </Typography>
                          <Button
                            variant="contained"
                            onClick={() => {
                              navigate(`/register`)
                              setModalOpen(false)
                            }}
                            sx={{ mt: 1, mr: 1 }}
                          >
                            Edit Registration
                          </Button>{' '}
                          <Button
                            onClick={() => {
                              setModalOpen(false)
                            }}
                            sx={{ mt: 1 }}
                          >
                            Close
                          </Button>
                        </>
                      )}
                  </Box>
                </Modal>
              </>
            )}
          {!counter && loading == false && (
            <div>
              <Button href={loginRedirect} variant="contained" color="secondary" startIcon={<LoginIcon />}>
                Login
              </Button>
            </div>
          )}
          {loading === true && (
            <Box sx={{ padding: '12px' }}>
              <Skeleton variant="circular" width={40} height={40}></Skeleton>
            </Box>
          )}
          {counter && user && (
            <div>
              {isDesktop && (
                <Chip
                  icon={<MonetizationOnIcon style={{ color: theme.palette.mode == 'dark' ? 'gold' : 'black' }} />}
                  label={Number(user.money).toLocaleString()}
                  size="small"
                  onClick={() => {
                    navigate(`/shop`)
                  }}
                  sx={{
                    backgroundColor: theme.palette.mode == 'dark' ? 'rgba(255, 215, 0, 0.5)' : 'gold',
                    cursor: 'pointer',
                    '& .MuiChip-label': {
                      height: '100%',
                      lineHeight: '200%',
                    },
                  }}
                  // sx={{backgroundColor: '#937F13', color: 'white'}}
                />
              )}
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
                sx={{
                  borderRadius: '0',
                  // textShadow: '0px 1px 3px black;0px 1px 3px black;0px 1px 3px black;'
                  // color: theme.palette.background.paper,
                  // textShadow: `-1px 0px 0px ${theme.palette.text.primary}, 1px 0px 0px ${theme.palette.text.primary}, 0px -1px 0px ${theme.palette.text.primary}, 0px 1px 0px ${theme.palette.text.primary}`
                  textShadow: `-1px 0px 0px #000000, 1px 0px 0px #000000, 0px -1px 0px #000000, 0px 1px 0px #000000`,
                  // bgcolor: alpha(theme.palette.primary.main, 0.5)
                }}
              >
                <Avatar
                  alt={`${counter.name}`}
                  src={`${(counter.avatar.length > 5 && `https://cdn.discordapp.com/avatars/${counter.discordId}/${counter.avatar}`) || `https://cdn.discordapp.com/embed/avatars/0.png`}`}
                ></Avatar>
                <XPDisplay />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {counter && counter.color && [
                    <Link
                      color={'inherit'}
                      underline="none"
                      key={'profileKey'}
                      href={`/counter/${counter.username}`}
                      onClick={(e) => {
                        e.preventDefault()
                        navigate(`/counter/${counter.username}`)
                        handleClose()
                      }}
                    >
                      <MenuItem>Profile</MenuItem>
                    </Link>,
                    <Link
                      color={'inherit'}
                      underline="none"
                      href={`/prefs`}
                      key={'prefsKey'}
                      onClick={(e) => {
                        e.preventDefault()
                        navigate(`/prefs`)
                        handleClose()
                      }}
                    >
                      <MenuItem>Preferences</MenuItem>
                    </Link>
                  ]
                }
                <Link onClick={handleClose} target={'_blank'} color="inherit" underline="none" href="https://discord.gg/bfS9RQht6M">
                  <MenuItem>Discord Server</MenuItem>
                </Link>
                <MenuItem
                  onClick={() => {
                    colorMode.toggleColorMode()
                  }}
                >
                  Theme: {theme.palette.mode.charAt(0).toUpperCase() + theme.palette.mode.slice(1)}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    logoutFunc()
                    handleClose()
                  }}
                >
                  Log Out
                </MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>
      {threadPickerMemo}
    </Box>
  )
}
