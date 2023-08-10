const commutesPerYear = 260 * 2;
const litresPerKM = 10 / 100;
const gasLitreCost = 1.5;
const litreCostKM = litresPerKM * gasLitreCost;
const secondsPerDay = 60 * 60 * 24;

type DistanceProps = {
  leg: google.maps.DirectionsLeg;
};

export default function Distance({ leg }: DistanceProps) {
  console.log(leg);
  if (!leg.distance || !leg.duration) return null;

  const days = Math.floor(
    (commutesPerYear * leg.duration.value) / secondsPerDay
  );

  const cost = Math.floor(
    (leg.distance.value / 1000) * litreCostKM * commutesPerYear
  );

  return (
    <div>
      <p>
        Start: <span className="highlight">{leg.start_address}</span>
      </p>
      <p>
        End: <span className="highlight">{leg.end_address}</span>
      </p>
      <p>
        This path is <span className="highlight">{leg.distance.text}</span>
      </p>{" "}
      That would take <span className="highlight">{leg.duration.text}</span> by
      foot.
    </div>
  );
}
