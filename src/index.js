import React from 'react';
import ReactDOM from 'react-dom';
import { RecoilRoot } from 'recoil';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import App from './components/App.js';
import Loader from './components/Loader.js';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorGraphic from './components/ErrorBoundary/ErrorGraphic.js';

// const onError = (error, errorInfo) => {
// 	console.log('Error!', error, errorInfo);
// };

//onError={onError}

const _uriArr = window.location.href.split('/');
let mode = '';
if (_uriArr[_uriArr.length - 1].includes('creatorapp.zoho.com')) {
	mode = 'widget';
} else if (_uriArr[_uriArr.length - 1].includes('zohocreatorportal.com')) {
	mode = 'portal';
} else {
	console.log('Other mode: ', _uriArr[_uriArr.length - 1]);
}


ReactDOM.render(
	<RecoilRoot>
		<React.Suspense fallback={<Loader show />}>
			<DndProvider backend={HTML5Backend}>
				<ErrorBoundary FallbackComponent={ErrorGraphic}>
					{mode === 'widget' ? <App /> : <div>Client Portal</div>}
				</ErrorBoundary>
			</DndProvider>
		</React.Suspense>
	</RecoilRoot>,
	document.getElementById('root')
);
