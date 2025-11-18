import './Overlays.css'

export function PilotOverlay() {
    return (
        <div className='overlay'>
            <div className="popup-content-top flight">
                <div className="popup-content-vnav"><span>ALT</span>{""}</div>
                <div className="popup-content-vnav"><span>FPM</span>{""}</div>
                <div className="popup-content-vnav"><span>GS</span>{""}</div>
                <div className="popup-content-vnav"><span>HDG</span>{""}</div>
            </div>
            <div className="popup-content flight">
                <figure className="popup-content-logo">
                    {/* <p style={{
                        color: airline.font ?? 'var(--color-green)',
                        fontSize: airline.iata.length && airline.iata.length > 2 ? '.8rem' : ''
                    }}>
                        {airline.iata}
                    </p> */}
                </figure>
                <div className="popup-content-main flight">
                    <div className="popup-content-header">{""}</div>
                    <div className='popup-content-box ac'>{""}</div>
                    {/* <p>{airports ? `${airports[0]} - ${airports[1]}` : 'NaN - NaN'}</p> */}
                    <div className='popup-content-box ac-fr'>{""}</div>
                </div>
            </div>
        </div>
    )
}