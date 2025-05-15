import './App.css';
import '../src/style.scss'

import React, { useEffect } from 'react'
import Navbar from '../src/Components/Navbar.jsx'
import { BrowserRouter,Route,Routes } from 'react-router-dom'
import GameCompo from './Components/Game.jsx'
import Summary from './Components/Summary.jsx';
import GroupSearch from './Components/searchGroup.jsx';
import LandingPage from './Components/LandingPage.jsx';
import ErrorDebug from './Components/ErrorBoundaries.jsx'
import ComebackSearch from './Components/searchComeback.jsx';
import { useState } from 'react'
import { Provider, ErrorBoundary } from '@rollbar/react';
import Footer from './Components/Footer.jsx';
import ErrorUI from './Components/ErrorUI.jsx';
import Recent from './Components/Recent.jsx';
const rollbarConfig = {
  accessToken: "080153f2e13741db822d5c74fd17150f",
  environment: 'production',
};

function App() {
  const [searchedArtistName, setSearchedArtistName] = useState("")
  const [searchWord,setSearchWord] = useState()
  const [otherSearchBarOption,setOtherSearchBarOption] = useState([])
  useEffect(() => {
  },[otherSearchBarOption,searchWord])

  return ( 
      //<Provider config={rollbarConfig}>
        <ErrorBoundary fallbackUI={ErrorUI}>
        <BrowserRouter>
          <div className="App">
            <Navbar setArtistName={setSearchedArtistName} searchFromOtherCompo={searchWord} setOtherSearchBarOption={setOtherSearchBarOption}/>
            <Routes>
              <Route exact path='/' element={<LandingPage/>}/>
              <Route path='/group/:id' element ={<GroupSearch setSearchWord={setSearchWord} searchBarOption={otherSearchBarOption} />} />
              <Route path='/comeback/:year/:month/:artist' element={<ComebackSearch searchedArtistName={searchedArtistName}/>} />
              <Route path='/brief' element={<Summary setSearchWord={setSearchWord} searchBarOption={otherSearchBarOption}/>}></Route>
              <Route path='/game' element={<GameCompo />}/>
              <Route path='/recent' element={<Recent />} />
            </Routes>
            <Footer />
          </div>
        </BrowserRouter>
      </ErrorBoundary>
      //</Provider>
     
    
  );
}

export default App;
