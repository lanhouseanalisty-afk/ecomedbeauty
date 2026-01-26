import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            question: "Quais são os diferenciais dos produtos MedBeauty?",
            answer: "Nossos produtos são desenvolvidos com tecnologia de ponta, seguindo os mais rigorosos padrões internacionais de qualidade. Contamos com certificações ISO, CE e aprovação da ANVISA, garantindo segurança e eficácia em todos os procedimentos."
        },
        {
            question: "Como posso me tornar um distribuidor autorizado?",
            answer: "Para se tornar um distribuidor autorizado MedBeauty, entre em contato através do nosso formulário ou ligue para nossa central de atendimento. Nossa equipe comercial irá apresentar as condições e requisitos necessários."
        },
        {
            question: "Vocês oferecem treinamento para profissionais?",
            answer: "Sim! Oferecemos cursos e treinamentos completos para profissionais da área estética. Acesse a Área do Aluno em nosso site para conhecer nossa grade de cursos disponíveis."
        },
        {
            question: "Qual o prazo de entrega dos produtos?",
            answer: "O prazo de entrega varia de acordo com a região. Em média, entregas para capitais são realizadas em até 5 dias úteis, e para demais localidades em até 10 dias úteis após a confirmação do pagamento."
        },
        {
            question: "Os produtos possuem garantia?",
            answer: "Sim, todos os nossos produtos possuem garantia de qualidade. Caso haja algum problema com o produto recebido, entre em contato com nosso SAC em até 7 dias após o recebimento."
        }
    ];

    return (
        <section className="py-20 bg-white">
            <div className="mx-auto max-w-4xl px-4 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                        Perguntas Frequentes
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Tire suas dúvidas sobre nossos produtos e serviços
                    </p>
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl border-2 border-border overflow-hidden transition-all duration-300 hover:border-primary/30"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-primary/5 transition-colors"
                            >
                                <span className="text-lg font-semibold text-foreground pr-4">
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    className={`w-6 h-6 text-primary flex-shrink-0 transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""
                                        }`}
                                />
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-300 ${openIndex === index ? "max-h-96" : "max-h-0"
                                    }`}
                            >
                                <div className="px-6 pb-5 pt-2 text-muted-foreground leading-relaxed">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
