# Death by MIPS: A MIPS Conversion Tool

## Introduction

MIPS assembly language has been a recurring topic throughout two consecutive semesters in the Computer Engineering curriculum: first in Intro to Microprocessors (EECE 3270) last spring, and again in Computer Organization (EECE 4278) this fall. The classes thoroughly cover machine code and MIPS assembly conversions; however, writing programs to do this for a user are not covered.

## Project & Rationale

Assigned for honors credit, this is a computer programming project written in JavaScript. The web interface accepts MIPS assembly code as input, then displays the equivalent binary and hexadecimal machine codes as output. Similarly, the application can accept binary or hexadecimal machine code as input and give equivalent MIPS assembly code as output.
I am particularly interested in coding and software development. This project is intended to help build a foundation in these areas.

## Deliverables

The deliverables for the Death By MIPS project are completed, working software as well as a presentation of the program for the EECE 4278 class.


## Program constraints/assumptions:

- Only recognizes core instruction set (no arithmetic or pseudo instructions)

- Label names specified in pseudodirect and pc-relative instructions will all be converted to lower case.

- PC values in pseudodirect and pc-relative instructions are assumed.

- Byte offset must be specified in base instructions.

- Formatting of output is prepared by javascript rather than web page.

- Input is not "comma-sensitive," that is, as long as there are spaces where commas should go, the program will not catch the formatting error.

- The web interface requires HTML 5 and was tested in the Google Chrome browser, version 61.0.3163.100 (Official Build) (64-bit)


## Some sample inputs:

- 0000 0001 0001 0001 0001 0101 0110 0000
- 001000 01001 10011 0000000010001000
- 00000001000100010001010101100000
- 0001 0001 0111 0011 0101 0101 0101 0100
- 0x015f5288
- 0x21330088
- 0x01525c40
- 3eb40401
- ad2a0401
- add $t1, $0, $t3
- andi   $s0,     $t0,    3    
- ori $s1, $s0, 0x22
- sw $a0, 20($3)
- lw $v0, 0x20($s0)
- beq $t0, $zero, done
- j loop
- jr $12
- jal mips_af

