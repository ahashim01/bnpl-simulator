import { Box, Container, Fade } from "@mui/material";
import AnimatedLoadingIndicator from "./AnimatedLoadingIndicator";

interface SuspenseFallbackProps {
  message?: string;
}

export default function SuspenseFallback({ message }: SuspenseFallbackProps) {
  return (
    <Fade in={true} style={{ transitionDelay: '300ms' }}>
      <Container maxWidth="lg" sx={{ height: '100vh' }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%'
        }}>
          <AnimatedLoadingIndicator message={message} />
        </Box>
      </Container>
    </Fade>
  );
}
