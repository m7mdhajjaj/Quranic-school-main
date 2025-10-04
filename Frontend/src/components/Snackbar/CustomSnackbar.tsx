import React, { useEffect, useState } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  Slide,
  Grow,
  Fade,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import { playNotificationSound } from '../../utils/notificationSounds';
import {
  CheckCircle,
  Error,
  Warning,
  Info,
  Close,
  Star,
  Celebration,
  Delete,
  Edit,
} from '@mui/icons-material';

interface CustomSnackbarProps {
  open: boolean;
  onClose: () => void;
  message: string;
  title?: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  variant?: 'standard' | 'filled' | 'outlined';
  animation?: 'slide' | 'grow' | 'fade';
  actionType?: 'add' | 'edit' | 'delete' | 'general';
  showProgress?: boolean;
}

function SlideTransition(props: React.ComponentProps<typeof Slide>) {
  return <Slide {...props} direction="down" />;
}

function GrowTransition(props: React.ComponentProps<typeof Grow>) {
  return <Grow {...props} />;
}

function FadeTransition(props: React.ComponentProps<typeof Fade>) {
  return <Fade {...props} />;
}

const CustomSnackbar: React.FC<CustomSnackbarProps> = ({
  open,
  onClose,
  message,
  title,
  severity,
  duration = 4000,
  variant = 'filled',
  animation = 'slide',
  actionType = 'general',
  showProgress = true,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (open) {
      playNotificationSound(severity);
      
      if (showProgress) {
        const timer = setInterval(() => {
          setProgress((prevProgress) => {
            if (prevProgress <= 0) return 0;
            return prevProgress - (100 / (duration / 100));
          });
        }, 100);

        return () => {
          clearInterval(timer);
          setProgress(100);
        };
      }
    }
  }, [open, duration, showProgress, severity]);

  const getIcon = () => {
    const iconStyle = {
      fontSize: 36,
      filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.25))',
      animation: 'iconPulse 2.5s ease-in-out infinite',
    };

    if (actionType === 'add') return <Star sx={{ ...iconStyle, color: '#fbbf24' }} />;
    if (actionType === 'edit') return <Edit sx={{ ...iconStyle, color: '#3b82f6' }} />;
    if (actionType === 'delete') return <Delete sx={{ ...iconStyle, color: '#ef4444' }} />;

    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
    };

    const icons = {
      success: CheckCircle,
      error: Error,
      warning: Warning,
      info: Info,
    };

    const Icon = icons[severity];
    return <Icon sx={{ ...iconStyle, color: colors[severity] }} />;
  };

  const getEmoji = () => {
    const emojis = {
      add: '✨',
      edit: '✏️',
      delete: '🗑️',
      general: '📢',
      success: '🎉',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    };
    return emojis[actionType] || emojis[severity];
  };

  const getTransition = () => {
    const transitions = {
      grow: GrowTransition,
      fade: FadeTransition,
      slide: SlideTransition,
    };
    return transitions[animation];
  };

  const getSeverityColors = () => {
    const colors = {
      success: {
        bg: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)',
        text: '#065f46',
        border: '#6ee7b7',
        glow: '16, 185, 129',
        accent: '#10b981',
      },
      error: {
        bg: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 50%, #fecaca 100%)',
        text: '#991b1b',
        border: '#fca5a5',
        glow: '239, 68, 68',
        accent: '#ef4444',
      },
      warning: {
        bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)',
        text: '#92400e',
        border: '#fcd34d',
        glow: '245, 158, 11',
        accent: '#f59e0b',
      },
      info: {
        bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)',
        text: '#1e40af',
        border: '#93c5fd',
        glow: '59, 130, 246',
        accent: '#3b82f6',
      },
    };
    return colors[severity];
  };

  const colors = getSeverityColors();

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      TransitionComponent={getTransition()}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{
        '& .MuiSnackbarContent-root': {
          minWidth: { xs: '340px', sm: '440px', md: '540px' },
        },
        '@keyframes iconPulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: 1 },
          '50%': { transform: 'scale(1.1)', opacity: 0.9 },
        },
        '@keyframes progressGlow': {
          '0%, 100%': { opacity: 0.6 },
          '50%': { opacity: 1 },
        },
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        '@keyframes shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      }}
    >
      <Alert
        variant={variant}
        severity={severity}
        icon={getIcon()}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={onClose}
            sx={{
              padding: '10px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1.5px solid rgba(255, 255, 255, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                transform: 'scale(1.15) rotate(90deg)',
                boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
              },
            }}
          >
            <Close 
              fontSize="small" 
              sx={{ 
                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))',
                fontWeight: 700,
              }} 
            />
          </IconButton>
        }
        sx={{
          width: '100%',
          minWidth: { xs: '340px', sm: '440px', md: '540px' },
          borderRadius: '24px',
          boxShadow: `0 25px 70px rgba(${colors.glow}, 0.2), 0 10px 30px rgba(0,0,0,0.15)`,
          border: `3px solid ${colors.border}`,
          backdropFilter: 'blur(20px)',
          fontFamily: 'Cairo, Tajawal, sans-serif',
          direction: 'rtl',
          position: 'relative',
          overflow: 'hidden',
          background: colors.bg,
          color: colors.text,
          
          // Progress bar
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '5px',
            background: showProgress
              ? `linear-gradient(90deg, ${colors.accent} ${progress}%, rgba(255,255,255,0.3) ${progress}%)`
              : 'transparent',
            transition: 'all 0.1s linear',
            boxShadow: showProgress 
              ? `0 2px 10px rgba(${colors.glow}, 0.4)` 
              : 'none',
            animation: showProgress ? 'progressGlow 2s ease-in-out infinite' : 'none',
          },
          
          // Shimmer effect
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '200%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
            animation: 'shimmer 3s infinite',
            pointerEvents: 'none',
          },

          // Decorative dots
          '& .decorative-dot': {
            position: 'absolute',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: colors.accent,
            animation: 'float 3s ease-in-out infinite',
            opacity: 0.7,
            '&:nth-of-type(1)': { top: '15%', right: '10px', animationDelay: '0s' },
            '&:nth-of-type(2)': { top: '50%', right: '15px', animationDelay: '1s' },
            '&:nth-of-type(3)': { top: '85%', right: '20px', animationDelay: '2s' },
          },
          
          '& .MuiAlert-icon': {
            fontSize: '36px',
            marginLeft: '16px',
            marginRight: '0',
            padding: '4px',
            alignItems: 'center',
          },
          
          '& .MuiAlert-message': {
            fontSize: '16px',
            fontWeight: 600,
            flex: 1,
            lineHeight: 1.6,
            textShadow: '0 1px 3px rgba(0,0,0,0.1)',
            letterSpacing: '0.3px',
            padding: '8px 0',
          },
          
          '& .MuiAlert-action': {
            marginRight: 0,
            marginLeft: '12px',
            padding: '4px',
            alignItems: 'flex-start',
          },
        }}
      >
        {/* Decorative floating dots */}
        <Box className="decorative-dot" />
        <Box className="decorative-dot" />
        <Box className="decorative-dot" />

        <Box sx={{ width: '100%', position: 'relative', zIndex: 1 }}>
          {title && (
            <AlertTitle 
              sx={{ 
                fontSize: '20px', 
                fontWeight: 800, 
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textShadow: '0 2px 4px rgba(0,0,0,0.15)',
                padding: '6px 0',
                borderRadius: '10px',
              }}
            >
              <Box 
                sx={{ 
                  fontSize: '26px',
                  filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.25))',
                  animation: actionType === 'add' ? 'float 2s ease-in-out infinite' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {getEmoji()} 
              </Box>
              <Typography 
                component="span" 
                sx={{ 
                  fontSize: '20px', 
                  fontWeight: 800,
                  letterSpacing: '0.5px',
                }}
              >
                {title}
              </Typography>
              {actionType === 'add' && (
                <Celebration 
                  sx={{ 
                    fontSize: 24, 
                    color: '#fbbf24',
                    filter: 'drop-shadow(0 2px 4px rgba(251, 191, 36, 0.4))',
                  }} 
                />
              )}
            </AlertTitle>
          )}
          <Typography 
            variant="body1" 
            sx={{ 
              fontSize: '15px',
              lineHeight: 1.7,
              fontWeight: 500,
              opacity: 0.95,
              letterSpacing: '0.2px',
            }}
          >
            {message}
          </Typography>
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default CustomSnackbar;