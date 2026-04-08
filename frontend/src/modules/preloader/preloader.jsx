import React from 'react';
import '../../styles/components/preloader/preloader.css';

const Preloader = ({ isClosing = false }) => {
	const preloaderClassName = isClosing ? 'page-preloader is-closing' : 'page-preloader';

	return (
		<div className={preloaderClassName} role="status" aria-live="polite" aria-label="Завантаження сторінки">
			<div className="preloader-stage">
				<div className="preloader-mark" aria-hidden="true">
					<div className="preloader-ring"></div>
					<div className="preloader-ring preloader-ring-delay"></div>
					<div className="preloader-core"></div>
				</div>
				<p className="preloader-title">OMFK Social</p>
				<p className="preloader-subtitle">Завантаження інтерфейсу</p>
			</div>
		</div>
	);
};

export default Preloader;
