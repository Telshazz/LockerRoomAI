import React from 'react';
import trophy from "../Assets/berman_trophy.png";
import '../Styles/Header.css';

const currency = (n) => { n=parseFloat(n); return isNaN(n) ? false : n.toFixed(2); }
const wholenum = (n) => { n=parseFloat(n); return isNaN(n) ? false : n.toFixed(0); }


const Header = (props) => {

  let player_count = (props.players.reduce((accumulator, object) => {
            return accumulator + 1; }, 0) );
  let total_players = global.config.player_cap * props.num_franchises;
  let player_pct = wholenum(player_count / total_players * 100);
  let player_spent = currency(props.players.reduce((accumulator, object) => {
            return accumulator + Number(object.salary); }, 0) );
  let total_spent = currency(global.config.salary_cap * props.num_franchises);
  let salary_pct = wholenum(player_spent / total_spent * 100);

  return (
    <header>
    <div className="pure-g">
      <div className="pure-u-1 pure-u-md-1-3 summary-info" id="total-players"> total players:
        <span><strong>{player_count}
        </strong> <small>/</small> {total_players} ({player_pct}%)</span>
       </div>
      <div className="pure-u-1 pure-u-md-1-3" id="main-header">
        <h1 className="is-center">
          Draft<img src={trophy} className="trophy-icon" alt="The Berman Trophy" />Board
        </h1>
        <p className="header-year is-center">{props.year}</p>
      </div>
      <div className="pure-u-1 pure-u-md-1-3 summary-info" id="total-spent"> total spent:
        <span><strong>${player_spent}
        </strong> <small>/</small> ${total_spent} ({salary_pct}%)</span>
       </div>
    </div>
    </header>
  );
}

export default Header;
