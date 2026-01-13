import Routing from "./routes/Routing";
import { ThemeProvider } from "../src/components/ThemeContext.jsx";

function App() {
  return (
    <ThemeProvider>
        <Routing />
    </ThemeProvider>
  );
}

export default App;
