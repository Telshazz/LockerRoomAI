import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {db} from "./firebase";
import {collection, getDocs, onSnapshot} from "firebase/firestore";

import Header from './Components/Header.js';
import DemoControls from './Components/DemoControls.js';
import Team from './Components/Team.js';

const currency = (n) => { n=parseFloat(n); return isNaN(n) ? false : n.toFixed(2); }
const wholenum = (n) => { n=parseFloat(n); return isNaN(n) ? false : n.toFixed(0); }
const maybenum = (n) => { return isNaN(Number(n)) ? n : Number(n); }


function Board() {
  const urlParams = useParams();

  const [players, setPlayers] = useState([]);
  const [franchises, setFranchises] = useState([]);
  const [demoPlayers, setDemoPlayers] = useState([]);

  const [sortField, setSortField] = useState("franchise"); 
  const [colorField, setColorField] = useState("remain");
  const [sortAscend, setSortAscend] = useState(1);
  const [expanded, setExpanded] = useState(true);
  const [anchorTarget, setAnchorTarget] = useState(null);

  const thisYear = urlParams.hasOwnProperty('year') ? urlParams.year : new Date().getFullYear();

  const franchise_sort_func = (f1, f2) => {
    return (maybenum(f1[sortField]) === maybenum(f2[sortField]) ?
            (f1.franchise <= f2.franchise ? -1: 1) :
            (maybenum(f1[sortField]) >= maybenum(f2[sortField]) ? 1 : -1) * sortAscend);
  }

  // sort roughly, but not exactly, in ascending order by salary
  const demo_player_sort_func = (p1, p2) => {
    return (Number(p1.salary) + (Math.random() * p1.salary * .5)) >= 
           (Number(p2.salary) + (Math.random() * p2.salary * .5)) ?
    1 : -1;
  }

  const compute_franchises = (players_temp) => {
    let franchise_set = new Set(players_temp.map(plyr => plyr.franchise))
    let franchises_temp = [...franchise_set].sort().map( franchise => ({"franchise": franchise}) );
    franchises_temp.forEach( franchise => {
      let franchise_players = players_temp.filter( player => player.franchise === franchise.franchise)
      franchise.player_count = franchise_players.length;
      franchise.player_count_off = franchise_players.filter( player => 
          ["QB", "RB", "WR", "TE", "WRTE"].includes(player.position) ).length;
      franchise.player_count_dst = franchise_players.filter( player => 
          ["K", "LB", "DE", "DB"].includes(player.position) ).length;
      franchise.spent = currency(franchise_players.reduce((accumulator, object) => {
          return accumulator + Number(object.salary); }, 0) );
      franchise.remain = currency(global.config.salary_cap - franchise.spent);
      franchise.maxbid = currency(global.config.salary_cap - franchise.spent 
          - ((global.config.player_cap - franchise.player_count) * global.config.bid_min) 
          + global.config.bid_min);
      franchise.total_rating = wholenum(franchise_players.reduce((accumulator, object) => {
          return accumulator + Number(object.rating); }, 0) );
      });
    return franchises_temp;
  }

  if (thisYear === 'demo') {
    window.history.replaceState("/year/demo", "Title", "/demo"); }

  // Only establish the snapshot listener at first render
  useEffect(() => {
    const collRef = collection(db, `years/${thisYear}/players`);
    const unsub_listener = onSnapshot(collRef, (snapshot) => {
      // console.log("Current snapshot: ", snapshot);
      let players_temp = [];

      snapshot.forEach((doc) => {
        let player_temp = doc.data();
        player_temp.name = player_temp.nameLast + ", " + player_temp.nameFirst;
        player_temp.salary = currency(player_temp.salary);
        players_temp.push(player_temp);
      });

      // Compute summaries for each franchise
      let franchises_temp = compute_franchises(players_temp);

      setPlayers(players_temp);
      setFranchises(franchises_temp);
    },
      (error) => {
        console.log("Listen error: ", error);
      });


    if (thisYear === 'demo') {
      let demoPlayers_temp = [];
      const collRef = 'years/demo-adds/players';
      getDocs(collection(db, collRef)).then((snapshot) => {
        snapshot.forEach((doc) => {
          let demoPlayer_temp = doc.data();
          demoPlayer_temp.name = demoPlayer_temp.nameLast + ", " + demoPlayer_temp.nameFirst;
          demoPlayer_temp.salary = currency(demoPlayer_temp.salary);
          demoPlayers_temp.push(demoPlayer_temp);
        });
      // Randomize the order once; popped elements will then be randomly "selected" 
      demoPlayers_temp.sort(demo_player_sort_func);
      setDemoPlayers(demoPlayers_temp);
      });
    }

  }, [thisYear]);


  useEffect(() => {
    if (anchorTarget) {
      document.getElementById(anchorTarget)
        .scrollIntoView({ behavior: 'smooth', block: 'end' });
      setAnchorTarget(null);
  }}, [anchorTarget]);


  return (
    <div className="content-wrapper">

      <Header year={thisYear} players={players} num_franchises={franchises.length}/>

      {thisYear==='demo' && <DemoControls 
                          players={players} setPlayers={setPlayers}
                          demoPlayers={demoPlayers} setDemoPlayers={setDemoPlayers}
                          compute_franchises={compute_franchises}
                          setFranchises={setFranchises}
                          /> }

      <div className="pure-g is-center">
        {franchises.sort(franchise_sort_func).map((franchise, i) =>
          <Team 
            franchise={franchise}
            franchise_index={i}
            players={players.filter(player => player.franchise === franchise.franchise)}
            sortField={sortField} colorField={colorField} 
            sortAscend={sortAscend} expanded={expanded}
            anchorTarget={anchorTarget}
            setSortField={setSortField} setColorField={setColorField} 
            setSortAscend={setSortAscend} setExpanded={setExpanded}
            setAnchorTarget={setAnchorTarget}
            key={franchise.franchise} />
        )}
      </div>
    </div>
  );
}

export default Board;
