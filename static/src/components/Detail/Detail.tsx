import { useFocusedSatellite, useSelectedStore } from '../../stores/selected.ts';
import { useDetailsQuery } from '../../queries/satDetail.ts';
import use3leQuery from '../../queries/sat3le.ts';
import { useSatCatQuery } from '../../queries/satCat.ts';

export default function Detail() {
    const selectSatellite = useSelectedStore(s => s.select);
    const focusedSatelliteIdx = useFocusedSatellite();

    const {data: tles} = use3leQuery();
    const {data: allDetails} = useDetailsQuery();
    const {data: satCat} = useSatCatQuery();
    
    const tle = tles?.[focusedSatelliteIdx];
    if (!tle || !allDetails || !satCat) { return; }

    let ucsDetail = null;
    const ucsResults = allDetails.slice().filter(e => parseInt(e.NORAD) == parseInt(tle.satnum));

    if (!ucsResults || ucsResults.length == 0) {
        ucsDetail = null;
    } else {
        ucsDetail = ucsResults[0];
    }

    let satcatDetail = null;
    const satcatResults = satCat.slice().filter(e => parseInt(e.noradCatId) == parseInt(tle.satnum));

    if (!satcatResults || satcatResults.length == 0) {
        satcatDetail = null;
    } else {
        satcatDetail = satcatResults[0];
    }

    
    let detailCard = <p>Details unavailable for this satellite</p>
    if (ucsDetail != null) {
        const detail = ucsDetail;
        detailCard = (
            <div className="card">
                <p>{detail.commonName}</p>
                <p>NORAD #{detail.NORAD}</p>
                <p>COSPAR {detail.COSPAR}</p>
                <p>Owner: {detail.owner} ({detail.ownerCountry})</p>
                <p>Users: {detail.users}</p>
                <p>Contractor: {detail.contractor} ({detail.contractorCountry})</p>
                <p>Launched from {detail.launchSite}</p>
                <p>Launch Vehicle: {detail.launchVehicle}</p>
                <p>Launched on {detail.t_0}</p>
                <p>Expected lifespan: {detail.L} years</p>
                <hr />
                <p>Purpose:</p>
                <p>{detail.purpose}</p>
                <p>{detail.detailedPurpose}</p>
                <hr />
                <p>Orbit Info:</p>
                <p>{detail.orbitClass}, {detail.orbitType}</p>
                <p>(a, p) = ({detail.r_a}km, {detail.r_p}km)</p>
                <p>-&gt; e = {detail.e}</p>
                <p>Inclination:{detail.i}&deg;</p>
                <p>Period:{detail.T} min</p>
            </div>
        )
    } else if (satcatDetail != null) {
        const detail = satcatDetail;
        detailCard = (
            <div className="card">
                <p>{detail.satname}</p>
                <p>NORAD #{detail.noradCatId}</p>
                <p>INTLDES: {detail.intldes}</p>
                <p>Country: {detail.country}</p>
                <p>Launched from {detail.site} on {detail.launch}</p>
                {detail.decay && <p>Decayed {detail.decay}</p>}
                <hr />
                <p>Object Info:</p>
                <p>{detail.objectType}</p>
                <p>{detail.comment}</p>
                <hr />
                <p>Orbit Info:</p>
                {detail.apogee && detail.perigee && <>
                    <p>(a, p) = ({detail.apogee}km, {detail.perigee}km)</p>
                    <p>-&gt; e = {(parseInt(detail.apogee) - parseInt(detail.perigee)) / (parseInt(detail.perigee) + parseInt(detail.apogee))}</p>
                </>}
                {detail.inclination && <p>Inclination:{detail.inclination}&deg;</p>}
                {detail.period && <p>Period:{detail.period} min</p>}
            </div>
        )
    }

    return (<>
        <p style={{marginBottom: "25px"}} onClick={() => selectSatellite(-1)}>&lt; Back to list</p>
        { detailCard }
    </>)
}