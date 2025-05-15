"use strict";
class CardConstruct {
    constructor(suitType, honorCard, point) {
        this.suit = evaluateSuitRank(suitType);
        this.honorCardRank = evaluteHonorCardRank(honorCard);
        if (this.honorCardRank > 0) {
            if (this.honorCardRank === 4) {
                this.point = 1;
            }
            else {
                this.point = 10;
            }
        }
        else {
            this.point = point;
        }
    }
}
function evaluateSuitRank(suitType) {
    switch (suitType) {
        case ('spade'): {
            return 4;
        }
        case ('heart'): {
            return 3;
        }
        case ('diamond'): {
            return 2;
        }
        case ('club'): {
            return 1;
        }
        default: {
            return 0;
        }
    }
}
function evaluteHonorCardRank(honorCard) {
    switch (honorCard) {
        case ('ace'): {
            return 4;
        }
        case ('king'): {
            return 3;
        }
        case ('queen'): {
            return 2;
        }
        case ('jack'): {
            return 1;
        }
        default: {
            return 0;
        }
    }
}
function findHighestRankCard(CardPairArray) {
    let highestCard;
    if (CardPairArray.Card_1.honorCardRank === 0 && CardPairArray.Card_2.honorCardRank === 0) {
        highestCard = CardPairArray.Card_1.point > CardPairArray.Card_2.point ? CardPairArray.Card_1 : CardPairArray.Card_2;
    }
    else {
        if (CardPairArray.Card_1.honorCardRank !== CardPairArray.Card_2.honorCardRank) {
            highestCard = CardPairArray.Card_1.honorCardRank > CardPairArray.Card_2.honorCardRank ? CardPairArray.Card_1 : CardPairArray.Card_2;
        }
        else {
            highestCard = CardPairArray.Card_1.suit > CardPairArray.Card_2.suit ? CardPairArray.Card_1 : CardPairArray.Card_2;
        }
    }
    return highestCard;
}
function card_1_higher_card_2_check(Card_1, Card_2) {
    let status;
    if (Card_1.honorCardRank === 0 && Card_2.honorCardRank === 0) {
        status = Card_1.point > Card_2.point ? true : false;
    }
    else {
        if (Card_1.honorCardRank !== Card_2.honorCardRank) {
            status = Card_1.honorCardRank > Card_2.honorCardRank ? true : false;
        }
        else {
            status = Card_1.suit > Card_2.suit ? true : false;
        }
    }
    return status;
}
function findHighestRankCard_Three(CardPairArray) {
    function findHighestRankCard_compare(Card_1, Card_2) {
        let highestCard;
        if (Card_1.honorCardRank === 0 && Card_2.honorCardRank === 0) {
            highestCard = Card_1.point > Card_2.point ? Card_1 : Card_2;
        }
        else {
            if (Card_1.honorCardRank !== Card_2.honorCardRank) {
                highestCard = Card_1.honorCardRank > Card_2.honorCardRank ? Card_1 : Card_2;
            }
            else {
                highestCard = Card_1.suit > Card_2.suit ? Card_1 : Card_2;
            }
        }
        return highestCard;
    }
    let Card_1 = CardPairArray.Card_1;
    let Card_2 = CardPairArray.Card_2;
    let Card_3 = CardPairArray.Card_3;
    let higherCard_Card_1_2 = findHighestRankCard_compare(Card_1, Card_2);
    let highestCard = findHighestRankCard_compare(higherCard_Card_1_2, Card_3);
    return highestCard;
}
function sortByPairRank(a, b) {
    let A_totalPoint = a.Card_1.point + a.Card_2.point >= 10 ? (a.Card_1.point + a.Card_2.point) % 10 : a.Card_1.point + a.Card_2.point;
    let B_totalPoint = b.Card_1.point + b.Card_2.point >= 10 ? (b.Card_1.point + b.Card_2.point) % 10 : b.Card_1.point + b.Card_2.point;
    let A_highestCard = findHighestRankCard(a);
    let B_highestCard = findHighestRankCard(b);
    return B_totalPoint - A_totalPoint || B_highestCard.honorCardRank - A_highestCard.honorCardRank || B_highestCard.suit - A_highestCard.suit;
}
function sortByPairRank_3cards(a, b) {
    let A_totalPoint = (a.Card_1.point + a.Card_2.point + a.Card_3.point) % 10;
    let B_totalPoint = (b.Card_1.point + b.Card_2.point + b.Card_3.point) % 10;
    let A_highestCard = findHighestRankCard(a);
    let B_highestCard = findHighestRankCard(b);
    return B_totalPoint - A_totalPoint || B_highestCard.honorCardRank - A_highestCard.honorCardRank || B_highestCard.suit - A_highestCard.suit;
}
function generateCardDeck() {
    let suitArray = ['spade', 'heart', 'diamond', 'club'];
    let honorCardArray = ['ace', 'king', 'queen', 'jack'];
    let cardDeck = [];
    suitArray.forEach((suit) => {
        let card;
        honorCardArray.forEach((honor) => {
            card = new CardConstruct(suit, honor, 0);
            cardDeck.push(card);
        });
        for (let i = 2; i < 11; i++) {
            card = new CardConstruct(suit, 'none', i);
            cardDeck.push(card);
        }
    });
    return cardDeck;
}
function generateTotalCardPermutation() {
    let cardDeck = generateCardDeck();
    let totalCombination = cardDeck.flatMap((obj1, i) => cardDeck.slice(i + 1).map(obj2 => {
        let returnObject = {
            Card_1: obj1,
            Card_2: obj2
        };
        return returnObject;
    })).sort(sortByPairRank);
    for (let i = 0; i < totalCombination.length; i++) {
        totalCombination[i].rank = i + 1;
    }
    return totalCombination;
}
function removePairsWithKnownCard(totalPair, knownCardPair) {
    let totalArray = totalPair;
    for (let i = 0; i < knownCardPair.length; i++) {
        totalArray = totalArray.filter(twoCardPair => {
            let currPair_Card1 = Object.values(twoCardPair.Card_1);
            let currPair_Card2 = Object.values(twoCardPair.Card_2);
            let knownCardPair_1 = Object.values(knownCardPair[i].Card_1);
            let knownCardPair_2 = Object.values(knownCardPair[i].Card_2);
            if ((checkTwoCardEqual(currPair_Card1, knownCardPair_1) && checkTwoCardEqual(currPair_Card2, knownCardPair_2)) || (checkTwoCardEqual(currPair_Card1, knownCardPair_2) && checkTwoCardEqual(currPair_Card2, knownCardPair_1))) {
                return true;
            } // current Card Pair
            else if ((checkTwoCardEqual(currPair_Card1, knownCardPair_1) && !checkTwoCardEqual(currPair_Card1, knownCardPair_2)) || (!checkTwoCardEqual(currPair_Card2, knownCardPair_1) && checkTwoCardEqual(currPair_Card2, knownCardPair_2))) {
                return false;
            }
            else {
                return true;
            }
        });
    }
    totalArray.forEach((elem, index) => elem.rank = index + 1);
    return totalArray;
}
function checkTwoCardEqual(Card1, Card2) {
    let checkStatus = false;
    for (let i = 0; i < 3; i++) {
        checkStatus = Card1[i] === Card2[i];
        if (checkStatus === false) {
            return false;
        }
    }
    if (checkStatus === true) {
        return true;
    }
    else {
        return false;
    }
}
function removeKnownCardsFromDeck(deck, ownCard, knownCardArray) {
    let totalKnownCard = [ownCard, ...knownCardArray];
    for (let i = 0; i < totalKnownCard.length; i++) {
        deck = deck.filter((obj) => {
            let currentCard = Object.values(obj);
            let knownCard_1 = Object.values(totalKnownCard[i].Card_1);
            let knownCard_2 = Object.values(totalKnownCard[i].Card_2);
            return !checkTwoCardEqual(currentCard, knownCard_1) && !checkTwoCardEqual(currentCard, knownCard_2);
        });
    }
    return deck;
}
function searchCard_in_Combination(searchData, ownCardPair) {
    let Card_1 = ownCardPair.Card_1;
    let Card_2 = ownCardPair.Card_2;
    return searchData.find((obj) => (obj.Card_1.suit === Card_1.suit && obj.Card_1.honorCardRank === Card_1.honorCardRank && obj.Card_1.point == Card_1.point && obj.Card_2.suit === Card_2.suit && obj.Card_2.honorCardRank === Card_2.honorCardRank && obj.Card_2.point === Card_2.point) || (obj.Card_2.suit === Card_1.suit && obj.Card_2.honorCardRank === Card_1.honorCardRank && obj.Card_2.point == Card_1.point && obj.Card_1.suit === Card_2.suit && obj.Card_1.honorCardRank === Card_2.honorCardRank && obj.Card_1.point === Card_2.point));
}
function search_Pair_in_Combination(searchData, ownCardPair) {
    let Card_1 = ownCardPair.Card_1;
    let Card_2 = ownCardPair.Card_2;
    return searchData.filter((obj) => (obj.Card_1.suit === Card_1.suit && obj.Card_1.honorCardRank === Card_1.honorCardRank && obj.Card_1.point == Card_1.point && obj.Card_2.suit === Card_2.suit && obj.Card_2.honorCardRank === Card_2.honorCardRank && obj.Card_2.point === Card_2.point) || (obj.Card_2.suit === Card_1.suit && obj.Card_2.honorCardRank === Card_1.honorCardRank && obj.Card_2.point == Card_1.point && obj.Card_1.suit === Card_2.suit && obj.Card_1.honorCardRank === Card_2.honorCardRank && obj.Card_1.point === Card_2.point));
}
function type_predicate_three_or_two_Cards(cardPair) {
    return cardPair.Card_3 !== undefined;
}
function getOwnCardStatus(ownCardPair, knownCard, unknownPlayer = 1) {
    let totalPossiblePairRank = generateTotalCardPermutation();
    let totalKnownCardPair = [ownCardPair, ...knownCard];
    let possiblePairRank = removePairsWithKnownCard(totalPossiblePairRank, totalKnownCardPair);
    let currentCard_beforeFilter = searchCard_in_Combination(possiblePairRank, ownCardPair);
    let currentCardDeck = generateCardDeck();
    currentCardDeck = removeKnownCardsFromDeck(currentCardDeck, ownCardPair, knownCard);
    let PairRankWithout_8_9 = possiblePairRank.filter((obj) => (obj.Card_1.point + obj.Card_2.point) < 8 || (obj.Card_1.point + obj.Card_2.point) % 10 < 8);
    /* removing 8 and 9 point value as they will not draw*/
    let ThreeCardPairCombination = [];
    for (let i = 0; i < PairRankWithout_8_9.length; i++) {
        for (let j = 0; j < currentCardDeck.length; j++) {
            if (!checkTwoCardEqual(Object.values(currentCardDeck[j]), Object.values(PairRankWithout_8_9[i].Card_1)) && !checkTwoCardEqual(Object.values(currentCardDeck[j]), Object.values(PairRankWithout_8_9[i].Card_2))) {
                ThreeCardPairCombination.push(Object.assign(Object.assign({}, PairRankWithout_8_9[i]), { Card_3: currentCardDeck[j] }));
            }
        }
    }
    ThreeCardPairCombination.sort(sortByPairRank_3cards).forEach((elem, index) => elem.rank = index + 1);
    if (currentCard_beforeFilter !== undefined) {
        let TwoCards_pointlimit_possiblePairRank = possiblePairRank.filter((obj) => {
            let totalpoint = obj.Card_1.point + obj.Card_2.point;
            totalpoint = totalpoint % 10;
            return checkTwoCardEqual(Object.values(currentCard_beforeFilter.Card_1), Object.values(obj.Card_1)) && checkTwoCardEqual(Object.values(currentCard_beforeFilter.Card_2), Object.values(obj.Card_2)) || totalpoint > 3 && totalpoint !== 10;
        });
        /* remove totalpoint is less than 4 for two cards and totalpoint equal to 10 */
        let TwoCards_pointlimit_possiblePairRank_without_8_9 = PairRankWithout_8_9.filter((obj) => {
            let totalpoint = obj.Card_1.point + obj.Card_2.point;
            totalpoint = totalpoint % 10;
            return checkTwoCardEqual(Object.values(currentCard_beforeFilter.Card_1), Object.values(obj.Card_1)) && checkTwoCardEqual(Object.values(currentCard_beforeFilter.Card_2), Object.values(obj.Card_2)) || totalpoint > 3 && totalpoint !== 10;
        });
        TwoCards_pointlimit_possiblePairRank.forEach((elem, index) => elem.rank = index + 1);
        TwoCards_pointlimit_possiblePairRank_without_8_9.forEach((elem, index) => elem.rank = index + 1);
        let currentCard_afterFilter = searchCard_in_Combination(TwoCards_pointlimit_possiblePairRank, ownCardPair);
        let currentCard_afterFilter_rank_in_pairRank_without_8_9 = searchCard_in_Combination(TwoCards_pointlimit_possiblePairRank_without_8_9, ownCardPair);
        let currentCard_point = (currentCard_beforeFilter.Card_1.point + currentCard_beforeFilter.Card_2.point) % 10;
        let currentCard_highestCard = findHighestRankCard(currentCard_beforeFilter);
        let possible_Draw = search_Pair_in_Combination(ThreeCardPairCombination, ownCardPair);
        let possible_GoodCard_Draw = possible_Draw.filter((obj) => {
            let totalpoint = obj.Card_1.point + obj.Card_2.point + obj.Card_3.point;
            if (totalpoint >= 10) {
                return totalpoint % 10 > currentCard_point;
            }
            else {
                return totalpoint > currentCard_point;
            }
        });
        let possible_BadCard_Draw = possible_Draw.filter((obj) => {
            let totalpoint = obj.Card_1.point + obj.Card_2.point + obj.Card_3.point;
            if (totalpoint >= 10) {
                return totalpoint % 10 <= currentCard_point;
            }
            else {
                return totalpoint <= currentCard_point;
            }
        });
        let percentile_of_possible_3cards = ThreeCardPairCombination.reduce((acc, curr) => {
            let currPoint = curr.Card_1.point + curr.Card_2.point + curr.Card_3.point;
            let highestCard_in_three = findHighestRankCard_Three(curr);
            currPoint = currPoint % 10;
            if (currPoint === currentCard_point) {
                if (card_1_higher_card_2_check(highestCard_in_three, currentCard_highestCard)) {
                    return acc + 1;
                }
                else {
                    return acc;
                }
            }
            else if (currPoint > currentCard_point) {
                return acc + 1;
            }
            else {
                return acc;
            }
        }, 0);
        if (currentCard_afterFilter !== undefined && currentCard_afterFilter.rank !== undefined && currentCard_afterFilter_rank_in_pairRank_without_8_9 !== undefined && currentCard_afterFilter_rank_in_pairRank_without_8_9.rank !== undefined) {
            let number_of_pair_with_opponent_card = (97 * unknownPlayer) - (unknownPlayer * 4);
            let number_of_3cards_possible_with_opponent_card = (50 - (unknownPlayer * 2)) * number_of_pair_with_opponent_card;
            return {
                possible_2card_pair: TwoCards_pointlimit_possiblePairRank.length,
                rank: currentCard_afterFilter.rank,
                percentile_if_2cards: (TwoCards_pointlimit_possiblePairRank.length - currentCard_afterFilter.rank) / TwoCards_pointlimit_possiblePairRank.length * 100,
                percentile_if_2cards_without_8_9: ((TwoCards_pointlimit_possiblePairRank_without_8_9.length - currentCard_afterFilter_rank_in_pairRank_without_8_9.rank) / TwoCards_pointlimit_possiblePairRank_without_8_9.length) * 100,
                uncertainty_2cards: (number_of_pair_with_opponent_card / 1225) * 100,
                uncertainty_3cards: (number_of_3cards_possible_with_opponent_card / ThreeCardPairCombination.length) * 100,
                percentile_if_3cards: (ThreeCardPairCombination.length - percentile_of_possible_3cards) / ThreeCardPairCombination.length * 100,
                possible_Draw_3cards: possible_Draw.length,
                GoodCard_if_Draw: possible_GoodCard_Draw.length,
                BadCard_if_Draw: possible_BadCard_Draw.length
            };
        }
        else {
            return false;
        }
    }
    else {
        return false;
    }
}
function createCardPair(suit_1, point_1, suit_2, point_2) {
    let parseInt_point_1 = parseInt(point_1);
    let parseInt_point_2 = parseInt(point_2);
    let firstCard, SecondCard;
    if (!Number.isNaN(parseInt_point_1)) {
        firstCard = new CardConstruct(suit_1, 'not', parseInt_point_1);
    }
    else {
        firstCard = new CardConstruct(suit_1, point_1, 0);
    }
    if (!Number.isNaN(parseInt_point_2)) {
        SecondCard = new CardConstruct(suit_2, 'not', parseInt_point_2);
    }
    else {
        SecondCard = new CardConstruct(suit_2, point_2, 0);
    }
    return {
        Card_1: firstCard,
        Card_2: SecondCard
    };
}
function check_Card_Exist(cardPair, checkCard) {
    return (cardPair.Card_1.suit === checkCard.suit && cardPair.Card_1.honorCardRank === checkCard.honorCardRank && cardPair.Card_1.point === checkCard.point) || (cardPair.Card_2.suit === checkCard.suit && cardPair.Card_2.honorCardRank === checkCard.honorCardRank && cardPair.Card_2.point === checkCard.point);
}
findHighestRankCard_Three({
    Card_1: {
        suit: 4, honorCardRank: 4, point: 1
    },
    Card_2: {
        suit: 2, honorCardRank: 2, point: 10
    },
    Card_3: {
        suit: 1, honorCardRank: 4, point: 1
    }
});
