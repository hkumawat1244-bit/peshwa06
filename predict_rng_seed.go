package main

import (
	"bytes"
	"fmt"
	"math"
	"math/rand"
	"os"
	"runtime"
	"strconv"
	"strings"
	"time"
)

const (
	GEN_LENGTH = 4000 // Kitne numbers generate karne hain check karne ke liye
	GEN_SKIPS  = 100  // Kitne numbers skip karne hain (agar platform skip karta hai)
	RANDN      = 2    // range (0-1 ke liye 2)
)

// Aapka observed sequence jo aapne diya tha
var observed = "0101111101100010010110111111010011000111000101110001110011110110001100111010010110010010111011011111"

type Progress struct {
	partitionId       int
	newSeedsChecked   int
	totalSeedsChecked int
	foundSeed         int64
}

// Seed check karne ka fast function
func check_seed(seed int64, rand_source *rand.Rand) bool {
	rand_source.Seed(seed)
	var genSeq bytes.Buffer

	// Initial skips
	for i := 0; i < GEN_SKIPS; i++ {
		rand_source.Intn(RANDN)
	}

	// Generate sequence
	for i := 0; i < GEN_LENGTH; i++ {
		val := rand_source.Intn(RANDN)
		if val == 1 {
			genSeq.WriteByte('1')
		} else {
			genSeq.WriteByte('0')
		}
	}

	genSeqStr := genSeq.String()
	
	// Check if the observed pattern exists in generated sequence
	// Hum 60 characters ka match check kar rahe hain accuracy ke liye
	if len(observed) >= 60 {
		return strings.Contains(genSeqStr, observed[:60])
	}
	return strings.Contains(genSeqStr, observed)
}

func seed_search(part_id int, lo int64, hi int64, found_seed_ch chan Progress) {
	rand_source := rand.New(rand.NewSource(0))
	printFreq := 50000 // Performance ke liye frequency badha di gayi hai
	seedsChecked := 0

	for currSeed := lo; currSeed < hi; currSeed++ {
		if check_seed(currSeed, rand_source) {
			found_seed_ch <- Progress{part_id, seedsChecked, seedsChecked, currSeed}
			return
		}
		seedsChecked++

		if seedsChecked%printFreq == 0 {
			found_seed_ch <- Progress{part_id, printFreq, seedsChecked, -1}
		}
	}
}

func main() {
	args := os.Args[1:]
	if len(args) < 1 {
		fmt.Println("Usage: go run main.go <number_of_threads>")
		fmt.Println("Example: go run main.go 4")
		return
	}

	num_partitions, _ := strconv.ParseInt(args[0], 10, 64)
	var seedMin int64 = 0
	var seedMax int64 = (1 << 31) - 1
	partition_size := (seedMax - seedMin) / num_partitions

	runtime.GOMAXPROCS(int(num_partitions))
	found_seed_ch := make(chan Progress)

	fmt.Printf("Starting Brute Force on %d threads...\n", num_partitions)

	for p := int64(0); p < num_partitions; p++ {
		lo := (partition_size * p) + seedMin
		hi := (partition_size * (p + 1)) + seedMin
		go seed_search(int(p), lo, hi, found_seed_ch)
	}

	progressReports := make([]int, num_partitions)
	totalChecked := 0
	startTime := time.Now()

	for {
		p := <-found_seed_ch

		if p.foundSeed != -1 {
			fmt.Printf("\n\n[!!!] SEED FOUND: %d\n", p.foundSeed)
			fmt.Printf("Time taken: %s\n", time.Since(startTime))
			os.Exit(0)
		}

		progressReports[p.partitionId] = p.totalSeedsChecked
		totalChecked += p.newSeedsChecked

		// Simple progress indicator
		if totalChecked % 100000 == 0 {
			elapsed := time.Since(startTime).Seconds()
			speed := float64(totalChecked) / math.Max(1, elapsed)
			fmt.Printf("\rChecked: %d | Speed: %.0f seeds/sec", totalChecked, speed)
		}
	}
}
