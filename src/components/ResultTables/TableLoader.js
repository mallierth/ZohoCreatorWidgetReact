import React from 'react';
//import { makeStyles } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';

const TableLoader = () => {

  return (
    <>
      <div sx={{ width: 1, '& > * + *': { mt: 2 } }}>
        <LinearProgress color="secondary" />
        <div sx={{ textAlign: 'center', mt: 2 }}>
            Loading results...
        </div>
      </div>
    </>
  );
}

export default TableLoader;