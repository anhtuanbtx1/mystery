import { NextResponse } from 'next/server';
import manu from '@/data/clubs/manu.json';
import arsenal from '@/data/clubs/arsenal.json';
import liverpool from '@/data/clubs/liverpool.json';
import chelsea from '@/data/clubs/chelsea.json';
import mancity from '@/data/clubs/mancity.json';
import tottenham from '@/data/clubs/tottenham.json';
import newcastle from '@/data/clubs/newcastle.json';
import barcelona from '@/data/clubs/barcelona.json';
import realmadrid from '@/data/clubs/realmadrid.json';
import atletico from '@/data/clubs/atletico.json';
import inter from '@/data/clubs/inter.json';
import acmilan from '@/data/clubs/acmilan.json';
import juventus from '@/data/clubs/juventus.json';
import bayern from '@/data/clubs/bayern.json';
import dortmund from '@/data/clubs/dortmund.json';
import roma from '@/data/clubs/roma.json';
import psg from '@/data/clubs/psg.json';
import wands from '@/data/clubs/wands.json';
import astonvilla from '@/data/clubs/astonvilla.json';
import valencia from '@/data/clubs/valencia.json';

export async function GET() {
  const aggregatedData = {
    manu,
    arsenal,
    liverpool,
    chelsea,
    mancity,
    tottenham,
    newcastle,
    barcelona,
    realmadrid,
    atletico,
    inter,
    acmilan,
    juventus,
    bayern,
    dortmund,
    roma,
    psg,
    astonvilla,
    valencia,
    wands
  };

  return NextResponse.json(aggregatedData);
}
