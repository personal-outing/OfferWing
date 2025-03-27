import { history } from '@ice/runtime';
import { Button } from 'antd';
import React from 'react';

function Tutorials(props) {
  return (
    <div className="tutorial" id="tutorial">
      <h1>Instructions and tips</h1>
      <Button className="tutorial-btn" onClick={() => history.push('/tutorials')}>Start learning</Button>
    </div>
  );
}

export default Tutorials;
