'use client'

import { useState } from 'react'
import { ChevronDown, Search, BookOpen, Dumbbell, Calendar, CreditCard, Activity, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'

function HelpItem({ question, answer }: { question: string; answer: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="border border-border bg-card rounded-xl overflow-hidden mb-3 shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full justify-between items-center p-5 text-left focus:outline-none bg-card hover:bg-muted/50 transition-colors"
      >
        <h4 className="font-medium tracking-tight text-foreground text-lg">{question}</h4>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 shrink-0 ml-4 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[800px] border-t border-border' : 'max-h-0'}`}>
        <div className="p-5 text-muted-foreground prose prose-sm dark:prose-invert max-w-none">
          {answer}
        </div>
      </div>
    </div>
  )
}

function HelpCategory({ title, icon: Icon, items, searchQuery }: { title: string, icon: any, items: any[], searchQuery: string }) {
  const filteredItems = items.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (typeof item.answer === 'string' && item.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (filteredItems.length === 0) return null

  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
      </div>
      <div className="space-y-3">
        {filteredItems.map((item, i) => (
          <HelpItem key={i} question={item.question} answer={item.answer} />
        ))}
      </div>
    </div>
  )
}

export default function HelpCenterPage() {
  const [search, setSearch] = useState('')

  const categories = [
    {
      title: "Gestion des Athlètes",
      icon: Users,
      items: [
        {
          question: "Comment inviter un nouvel athlète ?",
          answer: "Pour inviter un athlète, rendez-vous dans l'onglet 'Athlètes' depuis le menu latéral. Cliquez sur le bouton 'Nouvel athlète'. Renseignez simplement son adresse email et son nom. L'athlète recevra automatiquement un email (simulé dans cette version) et un compte sera créé. Vous pourrez alors cliquer sur sa fiche pour paramétrer son profil détaillé."
        },
        {
          question: "Comment consulter le dossier médical ou les informations d'un client ?",
          answer: "Cliquez sur l'athlète depuis la liste des athlètes. Vous accéderez à son profil complet contenant 4 onglets : Ses informations générales (poids, taille, numéros d'urgence, dossier médical), ses objectifs, son programme, et ses paiements."
        }
      ]
    },
    {
      title: "Entraînements & Programmes",
      icon: Dumbbell,
      items: [
        {
          question: "Quelle est la différence entre une Séance et un Programme ?",
          answer: (
            <div className="space-y-2">
              <p><strong>La Séance (Workout)</strong> est le contenu sportif brut. Par exemple 'Haut du corps - Force'. Elle contient une liste d'exercices, des séries et des répétitions. Vous la créez dans l'onglet 'Séances'.</p>
              <p><strong>Le Programme (Program)</strong> est la planification d'une séance pour un athlète précis à une date donnée. Une fois la séance créée, vous allez sur le dossier d'un athlète (ou dans l'onglet Programmes) pour 'Assigner une séance' dans son calendrier.</p>
            </div>
          )
        },
        {
          question: "Comment créer une séance type ?",
          answer: "Allez dans l'onglet 'Séances'. Cliquez sur 'Nouvelle séance type'. Donnez-lui un nom, une description, puis ajoutez les exercices un par un avec le nombre de séries, les répétitions et le temps de repos. Cette séance sera sauvegardée dans votre bibliothèque."
        },
        {
          question: "Comment programmer la semaine d'un athlète ?",
          answer: "Allez dans l'onglet 'Programmes' ou sur le profil de l'athlète. Cliquez sur 'Assigner une séance'. Choisissez une séance type de votre bibliothèque, sélectionnez l'athlète cible, et définissez la date prévue. L'athlète verra cette séance apparaître sur son tableau de bord le jour J."
        }
      ]
    },
    {
      title: "Métriques & Objectifs",
      icon: Activity,
      items: [
        {
          question: "Comment créer une métrique personnalisée (ex: Qualité du sommeil) ?",
          answer: "Allez dans l'onglet 'Objectifs' (Templates). Ici, vous pouvez créer des 'Métriques globales'. Par exemple, créez une métrique 'Qualité du sommeil' de type Nombre (de 1 à 10) avec une unité 'pts'. Une fois créée, cette métrique est disponible pour tous les athlètes."
        },
        {
          question: "Comment demander à un athlète de suivre une métrique ?",
          answer: "Allez sur la fiche de l'athlète, onglet 'Progression'. Cliquez sur 'Assigner une métrique'. Choisissez la métrique globale que vous avez créée (ex: Poids) et définissez une cible (ex: 75 kg). L'athlète aura désormais un champ de saisie sur son espace pour y entrer sa valeur tous les jours."
        }
      ]
    },
    {
      title: "Calendrier & Rendez-vous",
      icon: Calendar,
      items: [
        {
          question: "Comment fonctionne la prise de rendez-vous ?",
          answer: "L'outil gère vos appels ou séances présentielles. Vous définissez d'abord vos plages horaires de disponibilité dans 'Calendrier'. Les athlètes, depuis leur espace, voient vos créneaux et peuvent 'Prendre un RDV'. Le système vérifie automatiquement les chevauchements pour éviter les doublons."
        },
        {
          question: "Puis-je forcer un rendez-vous moi-même ?",
          answer: "Oui. Depuis la page Calendrier, il vous suffit de cliquer sur le quadrillage (sur le jour et l'heure désirée) pour ouvrir la fenêtre de création de rendez-vous. Sélectionnez le client concerné, ajustez la durée, et sauvegardez."
        },
        {
          question: "À quoi servent les 'Dispos' des athlètes ?",
          answer: "Les athlètes peuvent indiquer leurs plages horaires idéales (ex: Tous les soirs après 18h) dans leur espace. Ces informations remontent dans votre interface pour vous aider à proposer des séances ou des appels aux bons moments, sans avoir à leur demander par message."
        }
      ]
    },
    {
      title: "Facturation & Paiements",
      icon: CreditCard,
      items: [
        {
          question: "Comment ajouter une facture ou un paiement ?",
          answer: "Allez dans l'onglet 'Paiements'. Vous verrez la liste de toutes les transactions. Cliquez sur 'Nouveau paiement', sélectionnez le client, entrez le montant et choisissez le statut ('En attente' ou 'Payé'). Cela générera une entrée visible instantanément sur l'espace du client."
        },
        {
          question: "Comment relancer un impayé ?",
          answer: "Pour l'instant, les paiements en attente s'affichent avec une pastille jaune et rouge sur l'espace client. Vous pouvez repérer tous les impayés d'un coup d'œil dans l'onglet 'Paiements' et contacter l'athlète si nécessaire."
        }
      ]
    }
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Centre d'Aide</h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Trouvez rapidement les réponses à vos questions et apprenez à maîtriser la plateforme pour optimiser votre coaching.
        </p>
      </div>

      <div className="relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input 
          type="text"
          placeholder="Rechercher une question (ex: métrique, rendez-vous...)"
          className="pl-12 h-14 text-lg rounded-2xl shadow-sm border-border/50 bg-card"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mt-8">
        {categories.map((category, i) => (
          <HelpCategory 
            key={i} 
            title={category.title} 
            icon={category.icon} 
            items={category.items} 
            searchQuery={search} 
          />
        ))}

        {categories.every(cat => cat.items.filter(item => 
          item.question.toLowerCase().includes(search.toLowerCase()) || 
          (typeof item.answer === 'string' && item.answer.toLowerCase().includes(search.toLowerCase()))
        ).length === 0) && (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Aucun résultat trouvé</h3>
            <p className="text-muted-foreground mt-2">Essayez de reformuler votre recherche avec d'autres mots-clés.</p>
          </div>
        )}
      </div>
    </div>
  )
}
