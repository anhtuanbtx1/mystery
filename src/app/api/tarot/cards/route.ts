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
import inter from '@/data/clubs/inter.json';
import acmilan from '@/data/clubs/acmilan.json';
import juventus from '@/data/clubs/juventus.json';
import bayern from '@/data/clubs/bayern.json';
import dortmund from '@/data/clubs/dortmund.json';
import wands from '@/data/clubs/wands.json';
import cups from '@/data/clubs/cups.json';

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
    inter,
    acmilan,
    juventus,
    bayern,
    dortmund,
    wands,
    cups
  };

  return NextResponse.json(aggregatedData);
}
