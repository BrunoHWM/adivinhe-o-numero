import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(
    supabaseUrl || "https://placeholder.supabase.co",
    supabaseKey || "placeholder-key"
);

export default async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store");

    if (req.method !== "GET" && req.method !== "POST") {
        res.setHeader("Allow", "GET, POST");

        return res.status(405).json({
            error: "Método não permitido."
        });
    }

    if (!supabaseUrl || !supabaseKey) {
        console.error("Variáveis SUPABASE_URL ou SUPABASE_KEY ausentes.");

        return res.status(500).json({
            error: "Configuração do banco de dados incompleta."
        });
    }

    try {
        if (req.method === "GET") {
            const { data, error } = await supabase
                .from("ranking")
                .select("id, nome, pontuacao, tentativas, criado_em")
                .order("pontuacao", { ascending: false })
                .order("tentativas", { ascending: true })
                .order("criado_em", { ascending: true })
                .limit(10);

            if (error) throw error;

            return res.status(200).json(data);
        }

        const { nome, pontuacao, tentativas } = req.body || {};

        if (typeof nome !== "string") {
            return res.status(400).json({
                error: "Nome inválido."
            });
        }

        const nomeLimpo = nome.trim().replace(/\s+/g, " ");
        const pontos = Number(pontuacao);
        const numeroTentativas = Number(tentativas);

        if (nomeLimpo.length < 1 || nomeLimpo.length > 30) {
            return res.status(400).json({
                error: "O nome deve ter entre 1 e 30 caracteres."
            });
        }

        if (
            !Number.isInteger(pontos) ||
            pontos < 100 ||
            pontos > 1000
        ) {
            return res.status(400).json({
                error: "Pontuação inválida."
            });
        }

        if (
            !Number.isInteger(numeroTentativas) ||
            numeroTentativas < 1
        ) {
            return res.status(400).json({
                error: "Número de tentativas inválido."
            });
        }

        const { data, error } = await supabase
            .from("ranking")
            .insert({
                nome: nomeLimpo,
                pontuacao: pontos,
                tentativas: numeroTentativas
            })
            .select("id, nome, pontuacao, tentativas, criado_em")
            .single();

        if (error) throw error;

        return res.status(201).json({
            mensagem: "Pontuação salva com sucesso!",
            resultado: data
        });

    } catch (error) {
        console.error("Erro na API do ranking:", error);

        return res.status(500).json({
            error: "Não foi possível processar o ranking."
        });
    }
}