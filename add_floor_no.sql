-- Migration: Add floor_no column to rooms table
ALTER TABLE rooms ADD COLUMN floor_no INT NOT NULL DEFAULT 1;
