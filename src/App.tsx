import { OverlayProvider } from '@react-aria/overlays';
import 'twin.macro';
import Calendar from './components/Calendar';

const App = () => {
  return (
    <div className='App'>
      <OverlayProvider>
        <Calendar />
      </OverlayProvider>
    </div>
  );
};

export default App;
