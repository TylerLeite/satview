package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"math"
	"os"
	"strings"
	"time"

	"github.com/TylerLeite/go-satellite"
)

type ThreeLineElementSet struct {
	CommonName string
	Line1      string
	Line2      string
}

type SatData struct {
	CommonName string `json:"name"`
	SatNum     string `json:"satnum"`
	sat        satellite.Satellite

	Position        satellite.Vector3 `json:"r"`
	Velocity        satellite.Vector3 `json:"v"`
	Altitude        float64           `json:"altitude"`
	AngularVelocity satellite.Vector3 `json:"w"`
	AngularSpeed    float64           `json:"speed"`
}

// From satellite.ECIToLLA, but to get altitude we don't need gmst so I excised this part of the code
func getAltitude(pos satellite.Vector3) float64 {
	a := 6378.137     // Semi-major Axis
	b := 6356.7523142 // Semi-minor Axis
	f := (a - b) / a  // Flattening
	e2 := ((2 * f) - math.Pow(f, 2))

	sqx2y2 := math.Sqrt(math.Pow(pos.X, 2) + math.Pow(pos.Y, 2))

	latitude := math.Atan2(pos.Z, sqx2y2)

	// Oblate Earth Fix (not strictly necessary for this level of precision)
	C := 0.0
	for i := 0; i < 20; i++ {
		C = 1 / math.Sqrt(1-e2*(math.Sin(latitude)*math.Sin(latitude)))
		latitude = math.Atan2(pos.Z+(a*C*e2*math.Sin(latitude)), sqx2y2)
	}

	altitude := (sqx2y2 / math.Cos(latitude)) - (a * C)
	return altitude
}

func LoadData(filen string) (tles []ThreeLineElementSet, err error) {
	file, err := os.Open(filen)
	if err != nil {
		return nil, err
	}

	var lines []string
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		lines = append(lines, scanner.Text())

		if len(lines) == 3 {
			tles = append(tles, ThreeLineElementSet{
				CommonName: lines[0][2:], // Each line starts with its index; ignore it
				Line1:      lines[1],
				Line2:      lines[2],
			})
			lines = nil
		}
	}

	if len(lines) > 0 {
		err = fmt.Errorf("Encountered potentially incomplete 3le file. Remainder: %v", lines)
		return tles, err
	}

	return tles, nil
}

// Vector operations
func cross(a, b satellite.Vector3) (out satellite.Vector3) {
	out.X = a.Y*b.Z - a.Z*b.Y
	out.Y = -a.X*b.Z + a.Z*b.X
	out.Z = a.X*b.Y - a.Y*b.X
	return out
}

func scaleDown(a *satellite.Vector3, k float64) {
	a.X /= k
	a.Y /= k
	a.Z /= k
}

func length2(a satellite.Vector3) float64 {
	return a.X*a.X + a.Y*a.Y + a.Z*a.Z
}

func length(a satellite.Vector3) float64 {
	return math.Sqrt(a.X*a.X + a.Y*a.Y + a.Z*a.Z)
}

// Run SGP4 on all satellites in the data set
func PropagateAll(tles []ThreeLineElementSet) (satellites []SatData) {
	now := time.Now()
	for _, tle := range tles {
		sat := satellite.TLEToSat(tle.Line1, tle.Line2, satellite.GravityWGS84)
		pos, vel := satellite.Propagate(sat, now.Year(), int(now.Month()), now.Day(), now.Hour(), now.Minute(), now.Second())
		alt := getAltitude(pos)

		w := cross(pos, vel)
		scaleDown(&w, length2(pos))

		angularSpeed := length(w)
		scaleDown(&w, angularSpeed)

		// Calculate angular speed + normalized angular velocity serverside
		// This is used to predict future positions between runs of sgp4
		satellites = append(satellites, SatData{
			CommonName:      tle.CommonName,
			SatNum:          fmt.Sprintf("%05s", strings.TrimSpace(tle.Line1[2:7])), // a private variable in satellite.Satellite, so get it here instead
			sat:             sat,
			Position:        pos,
			Velocity:        vel,
			Altitude:        alt,
			AngularVelocity: w,
			AngularSpeed:    angularSpeed,
		})
	}

	return satellites
}

func main() {
	tles, _ := LoadData("data/3le")
	satellites := PropagateAll(tles)

	jsonStr, _ := json.MarshalIndent(satellites, "", "\t")
	fmt.Println(string(jsonStr))
}
