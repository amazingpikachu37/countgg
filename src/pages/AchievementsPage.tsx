import { useLocation, useNavigate} from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { useIsMounted } from '../utils/hooks/useIsMounted';
import { Box, Link, Typography } from '@mui/material';
import { useFetchAchievements } from '../utils/hooks/useFetchAchievements';
import { Loading } from '../components/Loading';
import { AchievementType } from '../utils/types';
import { AchievementSmall } from '../components/AchievementSmall';
import { UserContext } from '../utils/contexts/UserContext';

  export const AchievementsPage = () => {
    const { counter, loading, totalCounters } = useContext(UserContext);
    const { achievements, achievementsLoading, setAchievements, allAchievements } = useFetchAchievements();
    const [unearnedAchievements, setUnearnedAchievements] = useState<AchievementType[]>([]);
    const [earnedAchievements, setEarnedAchievements] = useState<AchievementType[]>([]);
    const [unearnedAchievementsLoading, setUnearnedAchievementsLoading] = useState(true);
    const isMounted = useIsMounted();
    const navigate = useNavigate();

    const location = useLocation();
    useEffect(() => {
        document.title = `Achievements | countGG`;
        return (() => {
          document.title = 'countGG';
        })
      }, [location.pathname]);

    useEffect(() => {
      if(allAchievements && allAchievements.length > 0) {
        // const publicAchievementsNotEarned = allPublicAchievements.filter(achievement => {
        //   return !achievements.some(userAchievement => userAchievement.id === achievement.id);
        // });
        const earned = allAchievements.filter(achievement => {
          return achievements.some(userAchievement => userAchievement.achievementId === achievement.id);;
        });
        const publicAchievementsNotEarned = allAchievements.filter(achievement => {
          return achievement.isPublic && !achievements.some(userAchievement => userAchievement.achievementId === achievement.id);;
        });
        const sortedUnearnedPublicAchievements = publicAchievementsNotEarned.sort((a, b) => {
          return b.countersEarned - a.countersEarned;
        });
        // const sortedAchievements = achievements.sort((a, b) => {
        //   return a.countersEarned - b.countersEarned;
        // });
        const sortedAchievements = achievements
        setUnearnedAchievements(sortedUnearnedPublicAchievements);
        setEarnedAchievements(earned);
        setAchievements(sortedAchievements);
        setUnearnedAchievementsLoading(false);
      }
    }, [allAchievements])
    
    if(!loading && !achievementsLoading && !unearnedAchievementsLoading && isMounted.current) {

      return (
        <Box sx={{ bgcolor: 'primary.light', flexGrow: 1, p: 2}}>
            <Typography sx={{mb: 1}} variant="h5">All Achievements</Typography>
            {allAchievements.map((achievement) => {
              const counter_achievement = achievements && counter ? achievements.find((counterachievement) => {return counterachievement.achievementId === achievement.id && counterachievement.counterUUID === counter.uuid }) : undefined
                return (
                <Box sx={{mt: 1, mb: 1}}>
                    <Link color={'inherit'} underline='none' href={`/achievements/${achievement.id}`} onClick={(e) => {e.preventDefault();navigate(`/achievements/${achievement.id}`);}}>
                        <AchievementSmall ofall={totalCounters} achievement={achievement} counterAchievement={counter_achievement} locked={!counter ? false : !achievements.some(userAchievement => userAchievement.achievementId === achievement.id && userAchievement.isComplete)}></AchievementSmall>
                    </Link>
                </Box>
                )
            })}            
        </Box>
        )
    } else {
      return (
        <Loading />
      );
      }
  };

