let target = input_line stdin
let button = input_line stdin

let allowed = Array.make 10 false

let digit_of_char c = Char.code c - Char.code '0'
let char_of_digit d = Char.chr (Char.code '0' + d)

let () =
  String.iter (fun c -> allowed.(digit_of_char c) <- true) button;

  let rec find_digit d no_zero =
    if d > 9 then None
    else if allowed.(d) && ((not no_zero) || d <> 0) then Some d
    else find_digit (d + 1) no_zero
  in

  let fill_min bytes start =
    match find_digit 0 false with
    | None -> ()
    | Some d ->
        let c = char_of_digit d in
        for i = start to Bytes.length bytes - 1 do
          Bytes.set bytes i c
        done
  in

  let same_length_candidate s =
    let len = String.length s in
    let out = Bytes.create len in
    let rec search pos =
      if pos = len then true
      else
        let lower = digit_of_char s.[pos] in
        let no_zero = pos = 0 && len > 1 in
        let rec try_digit d =
          if d > 9 then false
          else if (not allowed.(d)) || (no_zero && d = 0) then
            try_digit (d + 1)
          else begin
            Bytes.set out pos (char_of_digit d);
            if d = lower then
              if search (pos + 1) then true else try_digit (d + 1)
            else begin
              fill_min out (pos + 1);
              true
            end
          end
        in
        try_digit lower
    in
    if search 0 then Some (Bytes.to_string out) else None
  in

  let number_of_length len =
    let out = Bytes.create len in
    match find_digit 0 (len > 1) with
    | None -> None
    | Some first ->
        Bytes.set out 0 (char_of_digit first);
        fill_min out 1;
        Some (Bytes.to_string out)
  in

  let rec first_longer len =
    match number_of_length len with
    | Some s -> s
    | None -> first_longer (len + 1)
  in

  let answer =
    match same_length_candidate target with
    | Some s -> s
    | None -> first_longer (String.length target + 1)
  in
  print_endline answer
