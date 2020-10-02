use_bpm 130

i=0

K = 1


if K == 1
  ch = [:c1, :c2, :c3]
  k = :major_pentatonic
elsif K == 2
  ch = [:f1, :f2, :f3]
  k = :major_pentatonic
else
  ch = [:a1, :a2, :a3]
  k = :minor_pentatonic
end

live_loop :a do
  sync :ms
  use_synth :dsaw
  use_random_seed 302
  notes = (scale ch[1], k).shuffle
  play notes.tick, release: 0.35, cutoff: 80
  sleep 1.0/6
end

live_loop :ms do
  sleep 1
end

live_loop :m do
  sync :ms
  use_synth :dsaw
  use_random_seed 102
  notes = (scale ch[2], k).shuffle
  3.times do
    play notes.tick, release: 0.5, cutoff: 90
    sleep 0.25
  end
end

live_loop :bdrum do
  use_synth :tb303
  n = (ring *ch).tick
  play n, release: 0.95, cutoff: 50, res: 0.2, wave: 0
  sleep 1.0/4
end

define :bell do |n|
  # Triangle waves for the 'hit'
  synth :tri, note: n - 12, release: 0.1
  synth :tri, note: n + 0.1, release: 0.1
  synth :tri, note: n - 0.1, release: 0.1
  synth :tri, note: n, release: 0.2
  
  # Sine waves for the 'ringing'
  synth :sine, note: n + 24, release: 5
  synth :sine, note: n + 24.1, release: 5
  synth :sine, note: n + 24.2, release: 0.5
  synth :sine, note: n + 11.8, release: 5
  synth :sine, note: n, release: 5
  
  # Low sine waves for the bass
  synth :sine, note: n - 11.8, release: 8
  synth :sine, note: n - 12, release: 8
end


live_loop :midi_piano do
  use_real_time
  note, velocity = sync "/midi/casio_usb-midi/0/1/note_on"
  ch = [note, note+12, note-12]
  #ell note#, amp: velocity / 127.0*5
end


live_loop :drums do
  sync :ms
  sample :drum_heavy_kick
  sleep 1
  sample :drum_snare_soft
  sleep 2
  sample :drum_snare_soft
  sleep 0.5
end