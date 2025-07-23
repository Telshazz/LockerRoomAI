import React from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import Player from './Player.js';
import { invlerp, isDark, colors_ranks, colors_remain } from '../Utils/colorfuncs.js'
import '../Styles/Team.css';


// hack to combine a 2-level sort into 1 level
let position_sort_costs = new Map();
["DB", "LB", "K", "WRTE", "RB", "QB"].forEach((pos, i) => {
  position_sort_costs.set(pos, i * 1000);
});
const player_sort_func = (p1, p2) => {
  return (Number(p1.salary) + position_sort_costs.get(p1.combined_position)) >= 
         (Number(p2.salary) + position_sort_costs.get(p2.combined_position)) ?
  -1 : 1;
}


const Team = (props) => {

    const getBgColor = () => {
        const rangemin = (props.colorField === 'remain' ? 0 : global.config.rating_cscale_cap_min);
        const rangemax = (props.colorField === 'remain' ? global.config.salary_cap : 
                                                          global.config.rating_cscale_cap_max);
        let palette = require('color-interpolate')(props.colorField === 'remain' ? colors_remain : colors_ranks);
        let color_index = invlerp(rangemin, rangemax, Number(props.franchise[props.colorField]));
        return palette(color_index);
    }

    return (
        <div id={props.franchise.franchise.replace(/\W/g, '')}>
        <table className="team-container pure-table pure-table-bordered" 
               id={props.franchise_index===0 ? "first-table" : null}
               style={{marginBottom:(props.expanded ? 12 : 5), maxWidth:405}}>
        <caption style={{ backgroundColor:getBgColor(), 
                          color:isDark(getBgColor())?'#EEEEEE':'#000000', 
                          minWidth:405 }}
            onClick={(e)=>{if(e.target === e.currentTarget) {
                              props.setExpanded(!props.expanded);
                              props.setAnchorTarget(props.franchise.franchise.replace(/\W/g, ''));
                    }}}>
            <h2 className={ (props.sortField === "franchise") ? 
                            (props.sortAscend === 1 ? "underscore" : "overscore") :
                            undefined }
                onClick={()=>{props.setSortAscend(
                                props.sortField === "franchise" ? props.sortAscend * -1 : 1);
                              props.setSortField("franchise"); }}>
                {props.franchise.franchise}</h2>
            <span style={{ padding:4 }} 
                onClick={()=>{props.setSortAscend(
                              props.sortField === "player_count" ? props.sortAscend * -1 : -1);
                              props.setSortField("player_count"); }}>
                <small className={ (props.sortField === "player_count") ? 
                                   (props.sortAscend === 1 ? "underscore" : "overscore") :
                                   undefined
                                 }>plyrs</small>
                <small>:</small>
                <strong>{props.franchise.player_count_off}</strong>|
                <strong>{props.franchise.player_count_dst}</strong></span>
            <span onClick={()=>{props.setSortAscend(
                                  props.sortField === "spent" ? props.sortAscend * -1 : 1);
                                props.setSortField("spent"); 
                                props.setColorField("remain"); }}>
                <span style={{ paddingTop:4, paddingRight:0, paddingBottom:4, paddingLeft:4 }}>
                    <small className={ (props.sortField === "spent") ? 
                                       (props.sortAscend === 1 ? "underscore" : "overscore") :
                                       undefined }>spnt</small>
                    <small>:</small>
                    <strong>${props.franchise.spent}</strong></span>
                <span style={{ padding:1 }}>|</span>
                <span style={{ paddingTop:4, paddingRight:4, paddingBottom:4, paddingLeft:0 }}>
                    <small>left:</small><strong>${props.franchise.remain}</strong></span>
            </span>
            { /* <span><br></br></span> */ }
            <span style={{ padding:4 }} 
                onClick={()=>{props.setSortAscend(
                                props.sortField === "maxbid" ? props.sortAscend * -1 : -1);
                              props.setSortField("maxbid"); }}>
                <small className={ (props.sortField === "maxbid") ? 
                                   (props.sortAscend === 1 ? "underscore" : "overscore") :
                                   undefined }>max</small>
                <small>:</small>
                <strong>${props.franchise.maxbid}</strong></span>
            <span style={{ padding:4 }} 
                onClick={()=>{props.setSortAscend(
                                props.sortField === "total_rating" ? props.sortAscend * -1 : -1);
                              props.setSortField("total_rating"); 
                              props.setColorField("total_rating"); }}>
                <small className={ (props.sortField === "total_rating") ? 
                                   (props.sortAscend === 1 ? "underscore" : "overscore") :
                                   undefined }>rnkg</small>
                <small>:</small>
                <strong>{props.franchise.total_rating}</strong></span>
        </caption>
        <tbody>

        { /* Show Player rows if in "expanded" mode  */ }
        {props.expanded && <TransitionGroup className="team" component={null}>
                {props.players.sort(player_sort_func).map(player =>
                    <CSSTransition
                        key={player.name+player.position+player.team}
                        timeout={1600}
                        classNames='player'
                    >
                        <Player player={player} key={player.name+player.position+player.team} />
                    </CSSTransition>
                )}
            </TransitionGroup>
        }
        </tbody></table></div>
    
    )
}

export default Team;