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

ReactDOM.render(
	<RecoilRoot>
		<React.Suspense fallback={<Loader show />}>
			<DndProvider backend={HTML5Backend}>
				<ErrorBoundary FallbackComponent={ErrorGraphic}>
					<App />
				</ErrorBoundary>
			</DndProvider>
		</React.Suspense>
	</RecoilRoot>,
	document.getElementById('root')
);
