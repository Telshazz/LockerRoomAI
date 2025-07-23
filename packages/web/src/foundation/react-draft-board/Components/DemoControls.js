import React from 'react';
import '../Styles/DemoControls.css';


const DemoControls = (props) => {
  return (
    <div className="demo-controls is-center">
      <small><strong>Demo mode:</strong></small>
      <button className={ props.demoPlayers.length > 0 ? "pure-button" :
                          "pure-button pure-button-disabled" }
              onClick={()=>{
        let demoPlayers = [...props.demoPlayers]
        let players = [...props.players]

        let demoPlayer = demoPlayers.pop();
        if (demoPlayer) {
          players.push(demoPlayer);

          let franchise_temp = props.compute_franchises(players);

          props.setPlayers(players);
          props.setDemoPlayers(demoPlayers);
          props.setFranchises(franchise_temp);
        }

      }} >Add Player</button>

    </div>
  );
}

export default DemoControls;
