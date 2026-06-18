import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { domain, question } = body;
    
    // Giả lập xử lý BE Reading
    const result = {
      message: "Vũ trụ đã ghi nhận câu hỏi của bạn.",
      domain: domain || "Chung",
      question,
      cards: [
        { position: "Quá khứ", card: "Kẻ Ngốc" },
        { position: "Hiện tại", card: "Nữ Hoàng" },
        { position: "Tương lai", card: "Cỗ Xe" }
      ]
    };
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Yêu cầu không hợp lệ" }, { status: 400 });
  }
}
