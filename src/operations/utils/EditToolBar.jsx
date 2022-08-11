import React from 'react';
import { Toolbar, SaveButton } from 'react-admin';

function EditToolBar() {
  return (
    <Toolbar>
      <SaveButton />
    </Toolbar>
  );
}

/*
  function EditToolBar(props) {
    const { pristine } = props;
    return (
      <Toolbar {...props}>
        <SaveButton disabled={pristine} />
      </Toolbar>
    );
  }
*/

export default EditToolBar;
