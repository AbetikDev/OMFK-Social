import React from 'react';
import '../../styles/components/preloader/preloader.css';

const Preloader = ({ isClosing = false }) => {
	const preloaderClassName = isClosing ? 'page-preloader is-closing' : 'page-preloader';

	return (
		<div className={preloaderClassName} role="status" aria-live="polite" aria-label="Завантаження сторінки">
			<div className="loader">
				<span>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
				</span>
				<div className="base">
					<span></span>
					<div className="face"></div>
				</div>
			</div>

			<div className="longfazers">
				<span></span>
				<span></span>
				<span></span>
				<span></span>
			</div>
		</div>
	);
};

export default Preloader;
