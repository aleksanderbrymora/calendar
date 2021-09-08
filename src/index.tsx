import React from 'react';
import App from './App';
import GlobalStyles from './styles/GlobalStyles';

// ReactDOM.render(
//   <React.StrictMode>
//     <GlobalStyles />
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root'),
// );

const Calendar = () => {
  return (
    <div>
      <GlobalStyles />
      <App />
    </div>
  );
};

export default Calendar;
